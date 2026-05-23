# claude-sandbox

Disposable Docker container for running `claude --dangerously-skip-permissions`
with only this project's directory mounted in.

## Build once

```powershell
docker build -t claude-sandbox F:\Programming\Water\.docker
```

## Run

```powershell
docker run -it --rm `
  -v "F:\Programming\Water:/workspace" `
  -v claude-config:/home/node/.claude `
  claude-sandbox
```

The `claude-config` named volume persists your login across runs.
The project is bind-mounted — edits inside the container show up on the host.
Nothing else from the host filesystem is visible.

## Optional: add to PowerShell `$PROFILE`

```powershell
function claude-safe {
  docker run -it --rm `
    -v "${PWD}:/workspace" `
    -v claude-config:/home/node/.claude `
    claude-sandbox
}
```

Then `cd` into any project and run `claude-safe`.
