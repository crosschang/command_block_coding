"""P1a structural guard tests against the shipped patch and repository fixture.
No network calls, no game run, no GitHub writes."""
import pathlib,subprocess
r=pathlib.Path(__file__).resolve().parents[1]
p=r/'CBX_P1A_DISPATCHER_UNAPPLIED_0_0_93.patch'
s=p.read_text()
assert 'src/preview/runtime_dispatcher.ts' in s
assert 'src/blocks/runtime_bridge_blocks.ts' in s
assert 'MCFunctionRuntime.resolve(command)' in s
assert 'executeC3ThroughRuntime(cmd)' in s
assert 'MCFunctionExecutePreview.execute(command)' in s
assert 'loops.forever' not in s and 'loops.pause' not in s
assert 'MCFunctionCBX12Bridge.execute(command)' in s
assert 'FunctionFile' not in [line for line in s.splitlines() if line.startswith('+++ b/') and 'function_file.ts' not in line]
fixture=r/'tests/_baseline_context_fixture'
assert (fixture/'src/preview/runtime_dispatcher.ts').exists()
run=subprocess.run(['git','diff','--check'],cwd=fixture,capture_output=True,text=True)
assert run.returncode==0,run.stderr
print('P1a diff and invariant smoke PASS')
