// Collection verification, never an alternative Oyzu engine. Copy a committed
// project outside the repository and exercise the real CLI and delivered output.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawn, spawnSync} from 'node:child_process';
import net from 'node:net';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
function run(exe, args, cwd) {
  const result = spawnSync(exe, args, {cwd, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024});
  if (result.status !== 0) throw Error(`${path.basename(exe)} ${args.join(' ')} failed (${result.status}):\n${result.stderr}\n${result.stdout}`);
  return (result.stdout || result.stderr).trim();
}

export function recipeDigest(repo, commit, recipe) {
  const names = run('git', ['ls-tree', '-r', '--name-only', commit, '--', recipe], repo).split('\n').filter(Boolean);
  if (!names.length) throw Error('Missing committed recipe');
  return sha256(names.map(name => {
    const bytes = spawnSync('git', ['show', `${commit}:${name}`], {cwd: repo, encoding: null}).stdout;
    return `${name}\0${bytes.length}\0${sha256(bytes)}\n`;
  }).join(''));
}

export function copyCommittedProject(repo, commit, recipe, destination) {
  const prefix = recipe + '/project/';
  const rows = run('git', ['ls-tree', '-r', commit, '--', prefix], repo).split('\n');
  for (const row of rows) {
    const match = row.match(/^(100644|100755) blob ([0-9a-f]{40})\t(.+)$/);
    if (!match || !match[3].startsWith(prefix)) throw Error('Project contains nonregular committed material');
    const name = path.resolve(destination, match[3].slice(prefix.length));
    if (!name.startsWith(destination + path.sep)) throw Error('Project file leaves verification workspace');
    const source = spawnSync('git', ['cat-file', 'blob', match[2]], {cwd: repo, encoding: null});
    if (source.status !== 0) throw Error('Required committed project bytes are unavailable');
    fs.mkdirSync(path.dirname(name), {recursive: true});
    fs.writeFileSync(name, source.stdout, {mode: match[1] === '100755' ? 0o755 : 0o644});
  }
}

const consumers = new Set(['first-build', 'node-application', 'npm-package', 'go-command', 'go-workspace', 'python-package', 'maven-application', 'maven-reactor', 'gradle-application', 'ant-application', 'dotnet-library', 'docker-file-image', 'helm-chart', 'node-pnpm', 'polyglot-service', 'developer-tool', 'tasks-and-hooks', 'static-deployment', 'incremental-builds', 'platform-matrices']);
async function verifyNative(id, cli, output) {
  const recipe = JSON.parse(fs.readFileSync(path.join(root, 'catalog/coverage.json'))).recipes.find(item => item.id === id)?.path;
  if (!recipe || !consumers.has(id)) throw Error('No admitted native consumer check for recipe: ' + id);
  const commit = run('git', ['rev-parse', 'HEAD'], root);
  if (run('git', ['status', '--porcelain', '--', recipe], root)) throw Error('Commit recipe changes before recording verification');
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'oyzu-example-' + id + '-'));
  const commands = [];
  const previousUserConfig=process.env.OYZU_USER_CONFIG;
  const userConfig=path.join(scratch,'.oyzu/verification-user/config.toml');
  const invoke = args => {commands.push(['oyzu', ...args.map(value => value.replaceAll(scratch, '<project>'))]); return run(cli, args, scratch);};
  const findExecutable = name => {
    for (const directory of (process.env.PATH ?? '').split(path.delimiter)) {
      for (const suffix of process.platform === 'win32' ? ['.exe', '.cmd', ''] : ['']) {
        const candidate = path.join(directory, name + suffix);
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
      }
    }
    throw Error('Consumer prerequisite missing: ' + name);
  };
  const native = (name, args, allowMissing = false) => {
    commands.push(['oyzu', '--root', '<collection>', 'exec', '--', name, ...args.map(value => value.replaceAll(scratch, '<project>'))]);
    const result = spawnSync(cli, ['--root', root, 'exec', '--', findExecutable(name), ...args], {cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024});
    if (result.status !== 0 && !allowMissing) throw Error('Native consumer ' + name + ' failed: ' + result.stderr);
    return {status: result.status, text: result.stdout.trim()};
  };
  const containers = [];
  const goImage=['go-command','go-workspace','polyglot-service','platform-matrices'].includes(id)?process.env.EXAMPLES_GO_IMAGE:undefined;
  const build=options=>invoke(['build',...options,...(goImage?['--image','go='+goImage]:[])]);
  const container = (image, entrypoint, mounts, args) => {
    const identity = native('docker', ['image', 'inspect', image, '--format', '{{.Id}}']).text;
    if (!/^sha256:[a-f0-9]{64}$/.test(identity)) throw Error('Native consumer image identity unavailable');
    containers.push({image, digest: identity});
    return native('docker', ['run', '--rm', '--network', 'none', '--entrypoint', entrypoint,
      ...mounts.flatMap(mount => ['--mount', mount]), identity, ...args]).text;
  };
  try {
    copyCommittedProject(root,commit,recipe,scratch);
    const capturedGradle = id === 'gradle-application' && process.platform === 'win32';
    fs.mkdirSync(path.dirname(userConfig),{recursive:true});
    fs.writeFileSync(userConfig,'# Disposable verification user settings; native administration remains binding.\n'+(id==='incremental-builds'?'[cache]\ndir='+JSON.stringify(path.join(scratch,'.oyzu/proof-cache'))+'\n':''));
    process.env.OYZU_USER_CONFIG=userConfig;
    const captured = capturedGradle || id === 'node-pnpm' || id === 'tasks-and-hooks' || id === 'incremental-builds';
    if (fs.existsSync(path.join(scratch, 'oyzu.lock')) && !captured) invoke(['install', '--frozen']);
    invoke(['build', '--plan']);
    const full = ['first-build', 'node-application', 'npm-package', 'go-command', 'go-workspace', 'tasks-and-hooks', 'incremental-builds', 'platform-matrices'].includes(id);
    if(goImage) containers.push({purpose:'Provided Go build executor',image:goImage,digest:native('docker',['image','inspect',goImage,'--format','{{.Id}}']).text});
    build([...(captured ? ['--isolated'] : []), ...(full ? ['--full'] : [])]);
    invoke(['inspect', 'dist']);
    const manifest = JSON.parse(fs.readFileSync(path.join(scratch, 'dist', 'manifest.json'), 'utf8'));
    if (manifest.status !== 'succeeded' || !manifest.artifacts.length) throw Error('Expected a successful delivered artifact');
    const artifact = id === 'helm-chart' ? manifest.artifacts.find(item => item.path.endsWith('.tgz')) : id === 'polyglot-service' ? manifest.artifacts.find(item => item.target === 'service') : id === 'go-workspace' ? manifest.artifacts.find(item => item.name === 'primary') : manifest.artifacts[0];
    if (!artifact) throw Error('Expected native primary artifact missing');
    const executable = path.resolve(scratch, 'dist', artifact.path);
    if (!executable.startsWith(path.join(scratch, 'dist') + path.sep)) throw Error('Artifact leaves bundle');
    let actual, expected;
    if (id === 'first-build' || id === 'go-command') {
      const args = id === 'first-build' ? ['developer'] : [];
      commands.push(['<delivered executable>', ...args]);
      actual = run(executable, args, scratch);
      expected = id === 'first-build' ? 'Hello, developer! Built with Oyzu.' : 'Hello from Go.';
    } else if (id === 'node-application' || id === 'node-pnpm' || id === 'tasks-and-hooks' || id === 'incremental-builds') {
      actual = invoke(['exec', '--', 'node', path.join(executable, 'index.cjs')]);
      expected = id === 'tasks-and-hooks' ? 'Hello from tasks: local.' : 'Hello from Node.';
      if (!fs.existsSync(path.join(executable, 'LICENSE'))) throw Error('Delivered application license missing');
      if (id === 'tasks-and-hooks') {
        invoke(['--profile','preview','build','--isolated','--full']);
        const preview=JSON.parse(fs.readFileSync(path.join(scratch,'dist/manifest.json')));
        const previewArtifact=preview.artifacts[0];
        if(invoke(['exec','--','node',path.join(scratch,'dist',previewArtifact.path,'index.cjs')])!=='Hello from tasks: preview.') throw Error('Profile did not reach the generated input');
        fs.appendFileSync(path.join(scratch,'oyzu.toml'),'\n[profiles.invalid.env]\nGREETING_MODE="invalid"\n');
        const args=['--profile','invalid','build','--isolated','--full','--json'];
        commands.push(['oyzu',...args]);
        const failed=spawnSync(cli,args,{cwd:scratch,encoding:'utf8',maxBuffer:16*1024*1024});
        if(failed.status!==1) throw Error('Invalid hook prerequisite did not fail the build');
        const failure=JSON.parse(fs.readFileSync(path.join(scratch,'dist/manifest.json')));
        if(failure.status!=='failed'||failure.artifacts.length||!failure.actions.some(action=>action.id.includes('verify_input')&&action.status==='failed')) throw Error('Failed hook prerequisite did not block artifact publication');
      }
      if (id === 'incremental-builds') {
        const outcomes=value=>Object.values(value.extensions?.['oyzu.dev/action-cache']?.targets??{});
        invoke(['build','--isolated','--full']);
        const repeat=JSON.parse(fs.readFileSync(path.join(scratch,'dist/manifest.json')));
        if(repeat.artifacts[0].digest!==artifact.digest || !outcomes(repeat).some(value=>value.outcome==='reused') || !repeat.actions.some(action=>action.reuse?.originalRunId)) throw Error('Unchanged build did not report reuse with its original producer');
        for(const name of ['src/index.cjs','test/greeting.test.cjs']) {const target=path.join(scratch,name);fs.writeFileSync(target,fs.readFileSync(target,'utf8').replaceAll('Hello from Node.','Updated from Node.'));}
        invoke(['build','--isolated','--full']);invoke(['inspect','dist']);
        const changed=JSON.parse(fs.readFileSync(path.join(scratch,'dist/manifest.json')));
        if(changed.artifacts[0].digest===artifact.digest || !outcomes(changed).some(value=>value.outcome==='executed')) throw Error('Changed native input did not invalidate cached output');
        const changedOutput=invoke(['exec','--','node',path.join(scratch,'dist',changed.artifacts[0].path,'index.cjs')]);
        if(changedOutput!=='Updated from Node.') throw Error('Rebuilt consumer did not observe the source change');
        invoke(['build','--isolated','--full','--no-cache']);
        const fresh=JSON.parse(fs.readFileSync(path.join(scratch,'dist/manifest.json')));
        if(fresh.artifacts[0].digest!==changed.artifacts[0].digest || fresh.actions.some(action=>action.reuse)) throw Error('Fresh build disagreed with the changed result or reused work');
      }
    } else if (id === 'npm-package') {
      const consumer=path.join(scratch,'consumer');fs.mkdirSync(consumer);
      fs.writeFileSync(path.join(consumer,'package.json'),'{"private":true}\n');
      invoke(['exec','--','npm','install','--prefix',consumer,'--ignore-scripts','--no-audit','--no-fund','--offline',executable]);
      actual=invoke(['exec','--','node','-e',`console.log(require(${JSON.stringify(path.join(consumer,'node_modules/oyzu-example-greeting'))}).hello('developer'))`]);
      expected='Hello, developer, from the delivered package.';
    } else if (id === 'go-workspace') {
      if(!fs.existsSync(path.join(scratch,'go.work'))) throw Error('Native workspace source missing');
      if(run(executable,[],scratch)!=='Hello from the workspace library.') throw Error('Workspace consumer did not use its local library');
      const source=path.join(scratch,'shared/greeting.go');fs.writeFileSync(source,fs.readFileSync(source,'utf8').replace('Hello from the workspace library.','Updated workspace library.'));
      const test=path.join(scratch,'shared/greeting_test.go');fs.writeFileSync(test,fs.readFileSync(test,'utf8').replace('Hello from the workspace library.','Updated workspace library.'));
      build(['--full']);invoke(['inspect','dist']);
      const rebuilt=JSON.parse(fs.readFileSync(path.join(scratch,'dist/manifest.json')));
      const result=rebuilt.artifacts.find(item=>item.name==='primary');
      if(!result || result.digest===artifact.digest) throw Error('Workspace library change did not reach the executable');
      actual=run(path.join(scratch,'dist',result.path),[],scratch);expected='Updated workspace library.';
    } else if (id === 'maven-reactor') {
      const jars=manifest.artifacts.filter(item=>item.path.endsWith('.jar'));
      if(jars.length!==2 || !jars.some(item=>item.path.includes('greeting-app')) || !jars.some(item=>item.path.includes('greeting-library'))) throw Error('Both reactor module artifacts are required');
      actual=invoke(['exec','--','java','-cp',jars.map(item=>path.join(scratch,'dist',item.path)).join(path.delimiter),'example.Hello']);
      expected='Hello from the reactor library.';
    } else if (id === 'platform-matrices') {
      if(run(executable,[],scratch)!=='Hello from Go.') throw Error('Native host artifact failed');
      build(['--all-platforms','--full']);invoke(['inspect','dist']);
      const matrix=JSON.parse(fs.readFileSync(path.join(scratch,'dist/manifest.json')));
      const platformOf=target=>typeof target.platform==='string'?target.platform:target.platform.os+'/'+target.platform.arch;
      const targets=matrix.targets.map(platformOf);
      for(const platform of ['windows/amd64','linux/amd64','linux/arm64']) if(!targets.includes(platform)) throw Error('Declared artifact platform missing: '+platform);
      if(matrix.artifacts.length!==3 || new Set(matrix.artifacts.map(item=>item.path)).size!==3) throw Error('Matrix did not retain three distinct outputs');
      for(const item of matrix.artifacts){
        const target=matrix.targets.find(target=>target.id===item.target);
        const bytes=fs.readFileSync(path.join(scratch,'dist',item.path));
        const platform=platformOf(target);
        if(platform==='windows/amd64' && bytes.subarray(0,2).toString()!=='MZ') throw Error('Windows output is not PE');
        if(platform.startsWith('linux/') && (bytes.subarray(0,4).toString('hex')!=='7f454c46' || bytes.readUInt16LE(18)!==(platform.endsWith('/arm64')?183:62))) throw Error('Linux output architecture differs');
        if(platform==='linux/amd64') {
          const value=container(goImage??'oyzu-toolchain/go:1.24-mod0.25.0','/input/'+path.basename(item.path),['type=bind,source='+path.dirname(path.join(scratch,'dist',item.path))+',target=/input,readonly'],[]);
          if(value!=='Hello from Go.') throw Error('Linux amd64 delivered output failed');
        }
      }
      actual='Host executable and Linux amd64 consumer passed; all declared binary headers matched';expected=actual;
    } else if (['maven-application', 'gradle-application', 'ant-application'].includes(id)) {
      if (capturedGradle || id === 'ant-application') {
        const image = id === 'ant-application' ? 'oyzu-toolchain/ant:1.10.18-jdk17' : 'oyzu-toolchain/gradle:8.14.3-jdk17';
        actual = container(image, 'java', ['type=bind,source=' + path.dirname(executable) + ',target=/input,readonly'], ['-cp', '/input/' + path.basename(executable), 'example.Hello']);
      } else actual = invoke(['exec', '--', 'java', '-cp', executable, 'example.Hello']);
      expected = {'maven-application': 'Hello from Maven.', 'gradle-application': 'Hello from Gradle.', 'ant-application': 'Hello from Ant.'}[id];
    } else if (id === 'python-package') {
      const wheels = artifact.kind === 'directory' ? fs.readdirSync(executable).filter(name => name.endsWith('.whl')).map(name => path.join(executable, name)) : [executable];
      if (wheels.length !== 1) throw Error('Expected one delivered Python wheel');
      invoke(['exec', '--', 'python', '-m', 'venv', 'consumer']);
      const python = path.join(scratch, 'consumer', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
      invoke(['exec', '--', python, '-m', 'pip', 'install', '--no-index', '--no-deps', wheels[0]]);
      // Run outside the source directory so only the installed wheel supplies it.
      actual = invoke(['exec', '--', python, '-I', '-c', 'import greeting; print(greeting.hello())']);
      expected = 'Hello from Python.';
    } else if (id === 'helm-chart') {
      actual = container('oyzu-toolchain/helm:3.22.0', 'helm', ['type=bind,source=' + path.dirname(executable) + ',target=/input,readonly'], ['template', 'hello', '/input/' + path.basename(executable)]);
      if (!actual.includes('kind: ConfigMap') || !actual.includes('name: hello-greeting') || !actual.includes('message: "Hello from Helm."')) throw Error('Delivered chart rendered unexpected resources');
      expected = actual;
    } else if (id === 'docker-file-image') {
      const index = JSON.parse(native('tar', ['-xOf', executable, 'index.json']).text);
      if (index.manifests?.length !== 1 || !/^sha256:[a-f0-9]{64}$/.test(index.manifests[0].digest)) throw Error('Expected one OCI image manifest');
      const image = JSON.parse(native('tar', ['-xOf', executable, 'blobs/sha256/' + index.manifests[0].digest.slice(7)]).text);
      const reference = index.manifests[0].annotations?.['io.containerd.image.name'];
      if (!reference || !/^sha256:[a-f0-9]{64}$/.test(image.config?.digest)) throw Error('OCI image identity missing');
      const previous = native('docker', ['image', 'inspect', reference, '--format', '{{.Id}}'], true);
      const expectedIdentities = [image.config.digest, index.manifests[0].digest];
      if (previous.status === 0 && !expectedIdentities.includes(previous.text)) throw Error('Native consumer would overwrite an unrelated image tag');
      native('docker', ['load', '--input', executable]);
      const loaded = native('docker', ['image', 'inspect', reference, '--format', '{{.Id}}']).text;
      if (!expectedIdentities.includes(loaded)) throw Error('Loaded image identity differs from delivered OCI archive');
      const name = 'oyzu-examples-' + crypto.randomBytes(6).toString('hex');
      let created = false;
      try {
        native('docker', ['create', '--name', name, loaded, '/message.txt']);
        created = true;
        native('docker', ['cp', name + ':/message.txt', path.join(scratch, 'message.received')]);
        actual = fs.readFileSync(path.join(scratch, 'message.received'), 'utf8').trim();
      } finally {
        if (created) native('docker', ['rm', name]);
        if (previous.status !== 0) native('docker', ['image', 'rm', reference]);
      }
      expected = 'Hello from the image.';
    } else if (id === 'polyglot-service' || id === 'static-deployment') {
      if (id === 'polyglot-service' && !manifest.artifacts.some(item => item.target === 'web' && item.kind === 'directory')) throw Error('Frontend producer artifact missing');
      const reservation = net.createServer();
      await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve));
      const port = reservation.address().port;
      await new Promise(resolve => reservation.close(resolve));
      const server = id === 'static-deployment'
        ? spawn(cli, ['--root',scratch,'-C',scratch,'run','serve'],{cwd:scratch,stdio:['ignore','ignore','pipe'],env:{...process.env,SITE_DIR:executable,PORT:String(port)}})
        : spawn(executable, ['--listen', '127.0.0.1:' + port], {cwd: scratch, stdio:['ignore','ignore','pipe']});
      let serverError='';server.stderr.on('data',bytes=>{serverError=(serverError+bytes).slice(-4000);});
      const closed = new Promise(resolve => {server.once('exit',resolve); server.once('error',resolve);});
      commands.push(id === 'static-deployment' ? ['oyzu','run','serve','with SITE_DIR=<delivered directory> and PORT=<ephemeral-port>'] : ['<delivered service>', '--listen', '127.0.0.1:<ephemeral-port>']);
      try {
        let response;
        for (let attempt=0; attempt<120; attempt++) {
          try {response=await fetch('http://127.0.0.1:'+port+'/'); if(response.ok) break;} catch {}
          await new Promise(resolve=>setTimeout(resolve,250));
        }
        if (!response?.ok) throw Error('Delivered service did not respond\n'+serverError);
        const text=await response.text();
        if(id==='static-deployment') {
          if(text!==fs.readFileSync(path.join(executable,'index.html'),'utf8') || !text.includes('Served from the selected artifact.')) throw Error('Served bytes differ from selected static artifact');
          actual='Selected static artifact observed over HTTP';
        } else {
          if(!text.includes('Delivery works.')) throw Error('Delivered service did not serve embedded frontend');
          const api=await fetch('http://127.0.0.1:'+port+'/api/hello');
          if (!api.ok || (await api.json()).message !== 'Hello from the delivered service.') throw Error('Delivered service API failed');
          actual='Delivered frontend and API observed over HTTP';
        }
        expected=actual;
      } finally {server.kill(); await closed;}
    } else if (id === 'developer-tool') {
      if (run(executable,[],scratch)!=='Release channel: stable') throw Error('Workspace consumer returned wrong generated channel');
      invoke(['build']);
      const repeated=JSON.parse(fs.readFileSync(path.join(scratch,'dist/manifest.json')));
      if (repeated.artifacts[0].digest!==artifact.digest) throw Error('Unchanged workspace produced a different artifact');
      fs.writeFileSync(path.join(scratch,'channel.txt'),'PREVIEW\n');
      invoke(['build']); invoke(['inspect','dist']);
      const rebuilt=JSON.parse(fs.readFileSync(path.join(scratch,'dist/manifest.json')));
      if (rebuilt.artifacts[0].digest===artifact.digest) throw Error('Generator input change did not change artifact');
      actual=run(path.join(scratch,'dist',rebuilt.artifacts[0].path),[],scratch);
      expected='Release channel: preview';
      commands.push(['<delivered tool>', 'observed stable, unchanged repeat, then preview after channel.txt change']);
    } else if (id === 'dotnet-library') {
      const packages = artifact.kind === 'directory' ? fs.readdirSync(executable).filter(name => name.endsWith('.nupkg')) : [path.basename(executable)];
      if (packages.length !== 1 || !/^[a-zA-Z0-9.+-]+$/.test(artifact.version)) throw Error('Expected one versioned NuGet package');
      const consumer = path.join(scratch, 'consumer');
      fs.mkdirSync(consumer);
      fs.writeFileSync(path.join(consumer, 'Consumer.csproj'), `<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net10.0</TargetFramework></PropertyGroup><ItemGroup><PackageReference Include="Oyzu.Example.Greeting" Version="${artifact.version}" /></ItemGroup></Project>\n`);
      fs.writeFileSync(path.join(consumer, 'Program.cs'), 'System.Console.WriteLine(Oyzu.Example.Greeting.Hello());\n');
      const mounts = ['type=bind,source=' + (artifact.kind === 'directory' ? executable : path.dirname(executable)) + ',target=/input,readonly', 'type=bind,source=' + consumer + ',target=/consumer'];
      container('oyzu-toolchain/dotnet:10.0.401', 'dotnet', mounts, ['restore', '/consumer/Consumer.csproj', '--source', '/input', '--packages', '/consumer/packages']);
      actual = container('oyzu-toolchain/dotnet:10.0.401', 'dotnet', mounts, ['run', '--project', '/consumer/Consumer.csproj', '--no-restore']);
      expected = 'Hello from .NET.';
    }
    if (actual !== expected) throw Error('Delivered artifact consumer returned unexpected output');
    if (full && !manifest.reports.some(report => report.kind === 'junit' || /junit/i.test(JSON.stringify(report)))) throw Error('Native test report missing');
    const execution = manifest.extensions?.['oyzu.dev/invocation']?.execution ?? 'recorded-in-bundle';
    const record = {
      recipe: id, subject: {commit, recipe_sha256: recipeDigest(root, commit, recipe), recipe_tree: run('git', ['rev-parse', commit + ':' + recipe], root)},
      oyzu: {version: run(cli, ['--version'], scratch), binary_sha256: sha256(fs.readFileSync(cli))},
      host: {os: process.platform, arch: process.arch}, execution, target: manifest.targets[0].platform,
      commands, result: 'passed', artifact: {digest: artifact.digest, output: actual},
      nativeConsumerImages: containers,
      configurationScope:'Copied project and disposable empty user settings; native machine/organization controls retained',
      reports: manifest.reports.map(report => ({kind: report.kind, digest: report.digest})),
      limits: [full ? 'Full native checks selected; no other host or cross-compilation qualification' : 'Fast build and delivered consumer only; native quality checks not selected', 'No live publication or deployment qualification'],
      recordedAt: new Date().toISOString()
    };
    fs.mkdirSync(path.dirname(output), {recursive: true});
    fs.writeFileSync(output, JSON.stringify(record, null, 2) + '\n');
    console.log('Verified committed ' + id + ' recipe and delivered artifact consumer.');
  } catch (error) {
    const record={recipe:id,subject:{commit,recipe_sha256:recipeDigest(root,commit,recipe),recipe_tree:run('git',['rev-parse',commit+':'+recipe],root)},oyzu:{version:run(cli,['--version'],scratch),binary_sha256:sha256(fs.readFileSync(cli))},host:{os:process.platform,arch:process.arch},execution:'attempted-native-build',commands,result:'failed',diagnostic:{summary:error.message.split('\n')[0].replaceAll(scratch,'<project>').replaceAll(root,'<collection>'),code:error.message.match(/\b(?:TOOL|BUILD|CONFIG|COMMAND)_[A-Z_]+\b/)?.[0]??'CONSUMER_OR_PREREQUISITE_FAILURE'},limits:['This failed attempt does not qualify the recipe or its host/executor/target'],recordedAt:new Date().toISOString()};
    fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(record,null,2)+'\n');
    throw error;
  } finally {
    if(previousUserConfig===undefined)delete process.env.OYZU_USER_CONFIG;else process.env.OYZU_USER_CONFIG=previousUserConfig;
    if (!path.resolve(scratch).startsWith(path.resolve(os.tmpdir()) + path.sep)) throw Error('Verification cleanup leaves temporary storage');
    fs.rmSync(scratch, {recursive: true, force: true});
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [id, cli, output] = process.argv.slice(2);
    if (!consumers.has(id) || !cli || !path.isAbsolute(cli) || !output) throw Error('Usage: node verification/verify.mjs <recipe-id> <absolute-oyzu-path> <record-path>');
    await verifyNative(id, cli, path.resolve(output));
  } catch (error) {console.error(error.message); process.exitCode = 1;}
}
