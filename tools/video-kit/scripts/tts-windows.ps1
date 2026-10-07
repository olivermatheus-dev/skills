param([string]$Text, [string]$Voice, [string]$Out, [double]$Rate = 1.0)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Media.SpeechSynthesis.SpeechSynthesizer, Windows.Media.SpeechSynthesis, ContentType = WindowsRuntime]
$null = [Windows.Storage.Streams.DataReader, Windows.Storage.Streams, ContentType = WindowsRuntime]
$asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
function Await($op, [Type]$t) { $task = $asTask.MakeGenericMethod($t).Invoke($null, @($op)); $task.Wait(-1) | Out-Null; $task.Result }
$s = New-Object Windows.Media.SpeechSynthesis.SpeechSynthesizer
$v = [Windows.Media.SpeechSynthesis.SpeechSynthesizer]::AllVoices | Where-Object { $_.DisplayName -like "*$Voice*" -and $_.Language -like 'pt-*' } | Select-Object -First 1
if (-not $v) { throw "voz nao encontrada: $Voice" }
$s.Voice = $v
$s.Options.SpeakingRate = $Rate
$s.Options.IncludeWordBoundaryMetadata = $true
$stream = Await ($s.SynthesizeTextToStreamAsync($Text)) ([Windows.Media.SpeechSynthesis.SpeechSynthesisStream])
$reader = New-Object Windows.Storage.Streams.DataReader($stream.GetInputStreamAt(0))
$n = [uint32]$stream.Size
Await ($reader.LoadAsync($n)) ([uint32]) | Out-Null
$bytes = New-Object byte[] $n
$reader.ReadBytes($bytes)
[IO.File]::WriteAllBytes($Out, $bytes)
$words = @()
foreach ($tr in $stream.TimedMetadataTracks) { foreach ($c in $tr.Cues) { $words += [pscustomobject]@{ w = $c.Text; s = [math]::Round($c.StartTime.TotalSeconds, 3); e = [math]::Round(($c.StartTime + $c.Duration).TotalSeconds, 3) } } }
ConvertTo-Json -InputObject @($words) -Compress
