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

const consumers = new Set(['first-build', 'node-application', 'go-command', 'python-package', 'maven-application', 'gradle-application', 'ant-application', 'dotnet-library', 'docker-file-image', 'helm-chart', 'node-pnpm', 'polyglot-service', 'developer-tool', 'tasks-and-hooks', 'static-deployment']);
async function verifyNative(id, cli, output) {
  const recipe = JSON.parse(fs.readFileSync(path.join(root, 'catalog/coverage.json'))).recipes.find(item => item.id === id)?.path;
  if (!recipe || !consumers.has(id)) throw Error('No admitted native consumer check for recipe: ' + id);
  const commit = run('git', ['rev-parse', 'HEAD'], root);
  if (run('git', ['status', '--porcelain', '--', recipe], root)) throw Error('Commit recipe changes before recording verification');
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'oyzu-example-' + id + '-'));
  const commands = [];
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
  const container = (image, entrypoint, mounts, args) => {
    const identity = native('docker', ['image', 'inspect', image, '--format', '{{.Id}}']).text;
    if (!/^sha256:[a-f0-9]{64}$/.test(identity)) throw Error('Native consumer image identity unavailable');
    containers.push({image, digest: identity});
    return native('docker', ['run', '--rm', '--network', 'none', '--entrypoint', entrypoint,
      ...mounts.flatMap(mount => ['--mount', mount]), identity, ...args]).text;
  };
  try {
    const prefix = recipe + '/project/';
    const rows = run('git', ['ls-tree', '-r', commit, '--', prefix], root).split('\n');
    for (const row of rows) {
      const match = row.match(/^(100644|100755) blob ([0-9a-f]{40})\t(.+)$/);
      if (!match || !match[3].startsWith(prefix)) throw Error('Project contains nonregular committed material');
      const name = path.resolve(scratch, match[3].slice(prefix.length));
      if (!name.startsWith(scratch + path.sep)) throw Error('Project file leaves verification workspace');
      const source = spawnSync('git', ['cat-file', 'blob', match[2]], {cwd: root, encoding: null});
      if (source.status !== 0) throw Error('Required committed project bytes are unavailable');
      fs.mkdirSync(path.dirname(name), {recursive: true});
      fs.writeFileSync(name, source.stdout, {mode: match[1] === '100755' ? 0o755 : 0o644});
    }
    const capturedGradle = id === 'gradle-application' && process.platform === 'win32';
    const captured = capturedGradle || id === 'node-pnpm';
    if (fs.existsSync(path.join(scratch, 'oyzu.lock')) && !captured) invoke(['install', '--frozen']);
    invoke(['build', '--plan']);
    const full = ['first-build', 'node-application', 'go-command', 'tasks-and-hooks'].includes(id);
    invoke(full ? ['build', '--full'] : captured ? ['build', '--isolated'] : ['build']);
    invoke(['inspect', 'dist']);
    const manifest = JSON.parse(fs.readFileSync(path.join(scratch, 'dist', 'manifest.json'), 'utf8'));
    if (manifest.status !== 'succeeded' || !manifest.artifacts.length) throw Error('Expected a successful delivered artifact');
    const artifact = id === 'helm-chart' ? manifest.artifacts.find(item => item.path.endsWith('.tgz')) : id === 'polyglot-service' ? manifest.artifacts.find(item => item.target === 'service') : manifest.artifacts[0];
    if (!artifact) throw Error('Expected native primary artifact missing');
    const executable = path.resolve(scratch, 'dist', artifact.path);
    if (!executable.startsWith(path.join(scratch, 'dist') + path.sep)) throw Error('Artifact leaves bundle');
    let actual, expected;
    if (id === 'first-build' || id === 'go-command') {
      const args = id === 'first-build' ? ['developer'] : [];
      commands.push(['<delivered executable>', ...args]);
      actual = run(executable, args, scratch);
      expected = id === 'first-build' ? 'Hello, developer! Built with Oyzu.' : 'Hello from Go.';
    } else if (id === 'node-application' || id === 'node-pnpm' || id === 'tasks-and-hooks') {
      actual = invoke(['exec', '--', 'node', path.join(executable, 'index.cjs')]);
      expected = id === 'tasks-and-hooks' ? 'Hello from tasks: local.' : 'Hello from Node.';
      if (!fs.existsSync(path.join(executable, 'LICENSE'))) throw Error('Delivered application license missing');
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
        ? spawn(cli, ['--root',scratch,'-C',scratch,'run','serve'],{cwd:scratch,stdio:'ignore',env:{...process.env,SITE_DIR:executable,PORT:String(port)}})
        : spawn(executable, ['--listen', '127.0.0.1:' + port], {cwd: scratch, stdio:'ignore'});
      const closed = new Promise(resolve => {server.once('exit',resolve); server.once('error',resolve);});
      commands.push(id === 'static-deployment' ? ['oyzu','run','serve','with SITE_DIR=<delivered directory> and PORT=<ephemeral-port>'] : ['<delivered service>', '--listen', '127.0.0.1:<ephemeral-port>']);
      try {
        let response;
        for (let attempt=0; attempt<60; attempt++) {
          try {response=await fetch('http://127.0.0.1:'+port+'/'); if(response.ok) break;} catch {}
          await new Promise(resolve=>setTimeout(resolve,50));
        }
        if (!response?.ok) throw Error('Delivered service did not respond');
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
      fs.writeFileSync(path.join(scratch,'channel.txt'),'preview\n');
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
