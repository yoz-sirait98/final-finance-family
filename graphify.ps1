param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$CommandArgs
)

if (Test-Path "graphify-out/.graphify_python") {
    $PY = Get-Content "graphify-out/.graphify_python"
    & $PY -m graphify @CommandArgs
} else {
    Write-Error "graphify-out/.graphify_python not found. Please run the graphify scanner first."
}
