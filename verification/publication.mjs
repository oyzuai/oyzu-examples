// An explicit local test-builder witness and native destination consumer.
// It observes a real build; it never supplies missing evidence to `publish`.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {copyCommittedProject, recipeDigest} from './verify.mjs';
const collection = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [cli, projectInput, registryInput, repository, tag, recordPath] = process.argv.slice(2);
if (!cli || !path.isAbsolute(cli) || !recordPath || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository ?? '')) throw Error('Usage: publication.mjs ABS_CLI ABS_PROJECT LOOPBACK_REGISTRY OWNER/REPO EXISTING_TEST_TAG RECORD');
const registry = new URL(registryInput);
if (registry.protocol !== 'http:' || registry.hostname !== '127.0.0.1') throw Error('This local proof uses an anonymous loopback registry only');
if (!tag?.startsWith('examples-proof-')) throw Error('Use a separately provisioned disposable examples-proof- tag');
const token = process.env.EXAMPLES_GITHUB_TOKEN;
if (!token) throw Error('Set EXAMPLES_GITHUB_TOKEN privately with access only to the disposable release');
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'oyzu-example-publish-'));
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const digest = bytes => 'sha256:' + sha(bytes);
const assert = (value, message) => {if (!value) throw Error(message);};
const history = [];
const previousUserConfig=process.env.OYZU_USER_CONFIG;
const namespace = 'examples-'+crypto.randomBytes(8).toString('hex');
let retryStarted=false;
function command(args, expected = 0) {
  const env={...process.env};
  if(args[0]!=='publish'){delete env.EXAMPLES_GITHUB_TOKEN;delete env.EXAMPLES_PUBLICATION_SEED;}
  const result = spawnSync(cli, ['--root', scratch, '-C', scratch, ...args], {cwd:scratch, env, encoding:'utf8', maxBuffer:16*1024*1024});
  assert(result.status === expected, 'Oyzu ' + args.join(' ') + ' failed: ' + (result.stderr ?? '').replaceAll(token, '[REDACTED]') + '\n' + (result.stdout ?? '').replaceAll(token, '[REDACTED]'));
  history.push({args:args.map(value=>value===process.env.EXAMPLES_DOCKER_CLI?'<native Docker>':value.replaceAll(scratch,'<project>')),result:result.status});
  return result.stdout;
}
const pair = () => {
  const keys = crypto.generateKeyPairSync('ed25519');
  return {key:keys.privateKey, root:keys.publicKey.export({format:'der',type:'spki'}).subarray(-32).toString('base64'), seed:keys.privateKey.export({format:'der',type:'pkcs8'}).subarray(-32).toString('base64')};
};
const builder = pair(), publisher = pair();
const payloadType = 'application/vnd.in-toto+json';
const pae = bytes => Buffer.concat([Buffer.from(`DSSEv1 ${Buffer.byteLength(payloadType)} ${payloadType} ${bytes.length} `),bytes]);
function sign(statement) {
  const payload = Buffer.from(JSON.stringify(statement));
  const hint = digest(Buffer.from(builder.root,'base64'));
  return Buffer.from(JSON.stringify({mediaType:'application/vnd.dev.sigstore.bundle.v0.3+json',verificationMaterial:{publicKey:{hint}},dsseEnvelope:{payloadType,payload:payload.toString('base64'),signatures:[{keyid:hint,sig:crypto.sign(null,pae(payload),builder.key).toString('base64')}]}}));
}
function verifyEvidence(bytes, root, artifactDigest, predicateType) {
  const bundle = JSON.parse(bytes), envelope = bundle.dsseEnvelope;
  assert(envelope?.payloadType===payloadType,'Unexpected DSSE profile');
  const raw = Buffer.from(root,'base64');
  assert(bundle.verificationMaterial?.publicKey?.hint===digest(raw),'Evidence root changed');
  const key = crypto.createPublicKey({key:Buffer.concat([Buffer.from('302a300506032b6570032100','hex'),raw]),format:'der',type:'spki'});
  const bytesPayload = Buffer.from(envelope.payload,'base64');
  assert(envelope.signatures.length===1 && crypto.verify(null,pae(bytesPayload),key,Buffer.from(envelope.signatures[0].sig,'base64')),'Evidence signature failed');
  const statement = JSON.parse(bytesPayload);
  assert(statement.predicateType===predicateType && 'sha256:'+statement.subject[0].digest.sha256===artifactDigest,'Evidence subject/profile differs');
}
async function github(route, binary=false) {
  const response = await fetch('https://api.github.com'+route,{headers:{Authorization:'Bearer '+token,Accept:binary?'application/octet-stream':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},redirect:'manual'});
  if (binary && response.status===302) {
    const target = new URL(response.headers.get('location'));
    assert(target.origin==='https://release-assets.githubusercontent.com','Unexpected native download origin');
    const download = await fetch(target,{redirect:'error'}); // Never forward credentials.
    assert(download.ok,'Native asset download failed');
    return Buffer.from(await download.arrayBuffer());
  }
  assert(response.ok,'GitHub native GET failed ('+response.status+')');
  return binary?Buffer.from(await response.arrayBuffer()):response.json();
}
try {
  const sourceRecipe='publishing/multiple-destinations';
  assert(path.resolve(projectInput)===path.join(collection,sourceRecipe,'project'),'Use the canonical committed publication project');
  const git=args=>{const result=spawnSync('git',args,{cwd:collection,encoding:'utf8'});assert(result.status===0,'Required source identity unavailable');return result.stdout.trim();};
  const sourceCommit=git(['rev-parse','HEAD']);
  assert(!git(['status','--porcelain','--',sourceRecipe]),'Commit recipe changes before recording publication');
  const subject={commit:sourceCommit,recipe_tree:git(['rev-parse',sourceCommit+':'+sourceRecipe]),recipe_sha256:recipeDigest(collection,sourceCommit,sourceRecipe)};
  copyCommittedProject(collection,sourceCommit,sourceRecipe,scratch);
  const userConfig=path.join(scratch,'.oyzu/verification-user/config.toml');
  fs.mkdirSync(path.dirname(userConfig),{recursive:true});fs.writeFileSync(userConfig,'# Disposable verification user settings; native administration remains binding.\n');
  process.env.OYZU_USER_CONFIG=userConfig;
  const pom = path.join(scratch,'pom.xml');
  fs.writeFileSync(pom,fs.readFileSync(pom,'utf8').replace('<version>0.1.0</version>','<version>0.1.0-'+namespace+'</version>'));
  const configuration = fs.readFileSync(path.join(scratch,'oyzu.toml'),'utf8');
  command(['install','--frozen']);
  const started = new Date().toISOString();
  command(['build']);
  const finished = new Date().toISOString();
  command(['inspect','dist']);
  const manifest = JSON.parse(fs.readFileSync(path.join(scratch,'dist/manifest.json')));
  const artifact = manifest.artifacts[0];
  artifact.filename = path.basename(artifact.path);
  const buildParameters={command:'oyzu build',nativeVersion:artifact.version,sourceTree:manifest.source.treeDigest,sourceAdjustment:'Unique native Maven version for a disposable test attempt'};
  assert(manifest.status==='succeeded' && artifact.kind!=='directory','This proof requires a real finalized file');
  const payload = fs.readFileSync(path.join(scratch,'dist',artifact.path));
  assert(digest(payload)===artifact.digest,'Finalized file digest differs');
  const id = artifact.name==='primary'?artifact.target:artifact.target+'/'+artifact.name;
  const builderId = 'https://example.invalid/oyzu-examples/local-test-witness';
  const provenance = sign({_type:'https://in-toto.io/Statement/v1',subject:[{name:id,digest:{sha256:sha(payload)}}],predicateType:'https://slsa.dev/provenance/v1',predicate:{buildDefinition:{buildType:'https://example.invalid/oyzu-examples/observed-local-build',externalParameters:buildParameters,resolvedDependencies:[{uri:'git+https://github.com/oyzuai/oyzu-examples',digest:{gitCommit:sourceCommit}}]},runDetails:{builder:{id:builderId},metadata:{invocationId:crypto.randomUUID(),startedOn:started,finishedOn:finished}}}});
  fs.writeFileSync(path.join(scratch,'build.sigstore.json'),provenance);
  process.env.EXAMPLES_PUBLICATION_SEED = publisher.seed;
  const release = await github(`/repos/${repository}/releases/tags/${encodeURIComponent(tag)}`);
  assert(release.tag_name===tag,'Existing test release changed');
  // A second registry that is deliberately unavailable makes partial effects observable.
  const unavailable = new URL(registry); unavailable.port='26112';
  const configure = failure => fs.writeFileSync(path.join(scratch,'oyzu.toml'), configuration+`\n[publish.destinations.oci]\nkind="oci"\nregistry=${JSON.stringify(registry.origin)}\nrepository="${namespace}/files"\nartifacts=[${JSON.stringify(id)}]\n[publish.destinations.github]\nkind="github-release"\nrepository=${JSON.stringify(repository)}\ntag=${JSON.stringify(tag)}\ntokenEnv="EXAMPLES_GITHUB_TOKEN"\nartifacts=[${JSON.stringify(id)}]\n[publish.destinations.unavailable]\nkind="oci"\nregistry=${JSON.stringify(unavailable.origin)}\nrepository="${namespace}/files"\nartifacts=[${JSON.stringify(id)}]\n[publish.requirements.provenance]\nbundlePath="build.sigstore.json"\npublicKey=${JSON.stringify(builder.root)}\nbuilderId=${JSON.stringify(builderId)}\n[publish.requirements.signing]\nkeyEnv="EXAMPLES_PUBLICATION_SEED"\npublicKey=${JSON.stringify(publisher.root)}\n`);
  configure();
  const configuredPath=path.join(scratch,'oyzu.toml');
  fs.writeFileSync(configuredPath,fs.readFileSync(configuredPath,'utf8').replace('kind="github-release"\nrepository=', 'kind="github-release"\napiUrl="https://api.github.com"\nrepository='));
  fs.appendFileSync(path.join(scratch,'oyzu.toml'),'\n[publish.destinations.github.evidence]\nmode="destination"\n');
  const publish = destinations => ['publish','--manifest','dist/manifest.json',...destinations.flatMap(name=>['--destination',name]),'--json'];
  const partial = JSON.parse(command(publish(['oci','unavailable']),2));
  assert(partial.destinations.some(item=>item.outcome==='published') && partial.destinations.some(item=>item.outcome==='failed'),'Partial receipt did not retain both outcomes');
  const docker = process.env.EXAMPLES_DOCKER_CLI;
  assert(docker && path.isAbsolute(docker),'Set EXAMPLES_DOCKER_CLI to the native Docker executable; separately provision stopped container examples-proof-611-retry-registry at 127.0.0.1:26112');
  command(['exec','--',docker,'start','examples-proof-611-retry-registry']);
  retryStarted=true;
  const recovered = JSON.parse(command(publish(['oci','unavailable'])));
  assert(recovered.destinations.some(item=>item.outcome==='already-present') && recovered.destinations.some(item=>item.outcome==='published'),'Unchanged retry did not reconcile the first destination and finish the second');
  const first = JSON.parse(command(publish(['oci','github'])));
  const repeat = JSON.parse(command(publish(['oci','github'])));
  assert(repeat.destinations.every(item=>item.outcome==='already-present'),'Matching repeat was not reconciled');
  const oci = first.destinations.find(item=>item.kind==='oci').entries[0];
  const coordinate = oci.coordinate;
  const nativeManifest = await fetch(`${registry.origin}/v2/${coordinate.repository}/manifests/${oci.reference.split('@')[1]}`,{headers:{Accept:'application/vnd.oci.image.manifest.v1+json'}});
  assert(nativeManifest.ok,'Independent OCI manifest GET failed');
  const manifestBytes = Buffer.from(await nativeManifest.arrayBuffer());
  assert(digest(manifestBytes)===oci.reference.split('@')[1],'OCI manifest digest differs');
  const image = JSON.parse(manifestBytes);
  const configResponse=await fetch(`${registry.origin}/v2/${coordinate.repository}/blobs/${image.config.digest}`);
  assert(configResponse.ok,'Independent OCI config GET failed');
  const configBytes=Buffer.from(await configResponse.arrayBuffer());
  assert(digest(configBytes)===image.config.digest && configBytes.length===image.config.size,'OCI config identity differs');
  const layers=[];
  for(const layer of image.layers){const response=await fetch(`${registry.origin}/v2/${coordinate.repository}/blobs/${layer.digest}`);assert(response.ok,'OCI layer unavailable');const bytes=Buffer.from(await response.arrayBuffer());assert(digest(bytes)===layer.digest && bytes.length===layer.size,'OCI layer identity differs');layers.push(bytes);}
  assert(layers.some(bytes=>bytes.equals(payload)) && layers.some(bytes=>bytes.equals(provenance)),'OCI original bytes missing');
  const ociIntent=layers.find(bytes=>{
    try {const envelope=JSON.parse(bytes).dsseEnvelope;return envelope && JSON.parse(Buffer.from(envelope.payload,'base64')).predicateType==='https://oyzu.dev/attestations/publication-intent/v1alpha1';}catch{return false;}
  });
  assert(ociIntent,'OCI publication intent missing');
  verifyEvidence(ociIntent,publisher.root,artifact.digest,'https://oyzu.dev/attestations/publication-intent/v1alpha1');
  const assets = await github(`/repos/${repository}/releases/${release.id}/assets?per_page=100`);
  const names=[artifact.filename,artifact.filename+'.provenance.sigstore.json',artifact.filename+'.publication.sigstore.json'];
  const downloaded=[];
  for(const name of names){const asset=assets.find(item=>item.name===name);assert(asset,'Missing native GitHub asset: '+name);downloaded.push(await github(`/repos/${repository}/releases/assets/${asset.id}`,true));}
  assert(downloaded[0].equals(payload) && downloaded[1].equals(provenance),'GitHub original bytes differ');
  verifyEvidence(downloaded[1],builder.root,artifact.digest,'https://slsa.dev/provenance/v1');
  verifyEvidence(downloaded[2],publisher.root,artifact.digest,'https://oyzu.dev/attestations/publication-intent/v1alpha1');
  const received = path.join(scratch,'received.jar'); fs.writeFileSync(received,downloaded[0]);
  const consumer = command(['exec','--','java','-cp',received,'example.Hello']).trim();
  assert(consumer==='Hello from Maven.','Retrieved JAR consumer failed');
  // Produce a second genuine build at the occupied filename; never edit a manifest digest.
  const java = path.join(scratch,'src/main/java/example/Hello.java');
  fs.writeFileSync(java,fs.readFileSync(java,'utf8').replace('Hello from Maven.','Conflicting candidate.'));
  const conflictStarted=new Date().toISOString();command(['build']);
  const second=JSON.parse(fs.readFileSync(path.join(scratch,'dist/manifest.json'))).artifacts[0];
  const secondPayload=fs.readFileSync(path.join(scratch,'dist',second.path));
  const statement=JSON.parse(Buffer.from(JSON.parse(provenance).dsseEnvelope.payload,'base64'));
  statement.subject[0].digest.sha256=sha(secondPayload); statement.predicate.runDetails.metadata={invocationId:crypto.randomUUID(),startedOn:conflictStarted,finishedOn:new Date().toISOString()};
  fs.writeFileSync(path.join(scratch,'build.sigstore.json'),sign(statement));
  const conflict=command(publish(['github']),1);
  assert(conflict.includes('PUBLISH_CONFLICT'),'Occupied GitHub filename did not fail as conflict');
  const original=assets.find(item=>item.name===artifact.filename);
  assert((await github(`/repos/${repository}/releases/assets/${original.id}`,true)).equals(payload),'Conflict replaced original bytes');
  const record={recipe:'publication-multiple',subject,parameters:buildParameters,oyzu:{version:spawnSync(cli,['--version'],{encoding:'utf8'}).stdout.trim(),binary_sha256:sha(fs.readFileSync(cli))},host:{os:process.platform,arch:process.arch},result:'passed',execution:'observed-local-build-and-live-providers',repository,tag,releaseId:release.id,artifact:{digest:artifact.digest,consumer},testWitness:{builderId,builderPublicKey:builder.root,publicationPublicKey:publisher.root},commands:history,observations:['OCI partial failure preserved successful first destination','unchanged retry reconciled completed effects and finished the remaining destination','OCI and GitHub native retrieval matched original payload/provenance','matching repeat reconciled both destinations','retrieved JAR ran independently','occupied GitHub filename refused and original asset stayed unchanged'],limits:['Explicit local test-witness keys; no protected origin, keyless identity, transparency or SLSA-level claim','Anonymous loopback OCI and GitHub.com only','Temporary registry/tag/release provisioned separately; no product release'],recordedAt:new Date().toISOString()};
  fs.mkdirSync(path.dirname(path.resolve(recordPath)),{recursive:true});fs.writeFileSync(recordPath,JSON.stringify(record,null,2)+'\n');
  console.log('Live OCI/GitHub publication, native retrieval, repeat, partial effects and conflict passed.');
} finally {
  delete process.env.EXAMPLES_PUBLICATION_SEED;
  if(retryStarted) spawnSync(cli,['--root',collection,'exec','--',process.env.EXAMPLES_DOCKER_CLI,'stop','examples-proof-611-retry-registry'],{cwd:collection,stdio:'ignore'});
  if(previousUserConfig===undefined)delete process.env.OYZU_USER_CONFIG;else process.env.OYZU_USER_CONFIG=previousUserConfig;
  assert(path.resolve(scratch).startsWith(path.resolve(os.tmpdir())+path.sep),'Cleanup outside owned temporary storage');
  fs.rmSync(scratch,{recursive:true,force:true});
}
