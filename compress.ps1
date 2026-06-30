[Reflection.Assembly]::LoadWithPartialName("System.Drawing") | Out-Null

function Compress-Image {
    param (
        [string]$Path,
        [int]$Quality = 75,
        [int]$MaxWidth = 1600
    )
    
    try {
        $img = [System.Drawing.Image]::FromFile($Path)
        
        $width = $img.Width
        $height = $img.Height
        
        if ($width -gt $MaxWidth) {
            $ratio = $MaxWidth / $width
            $width = $MaxWidth
            $height = [int]($height * $ratio)
            
            $bmp = New-Object System.Drawing.Bitmap($width, $height)
            $g = [System.Drawing.Graphics]::FromImage($bmp)
            $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $g.DrawImage($img, 0, 0, $width, $height)
            $g.Dispose()
            $img.Dispose()
            $img = $bmp
        }
        
        $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.FormatDescription -eq "JPEG" }
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $Quality)
        
        $tempPath = $Path + ".tmp"
        $img.Save($tempPath, $encoder, $encoderParams)
        $img.Dispose()
        
        Remove-Item $Path -Force
        Rename-Item $tempPath (Split-Path $Path -Leaf)
        Write-Host "Successfully compressed: $(Split-Path $Path -Leaf)"
    } catch {
        Write-Error "Failed to compress $Path : $_"
        if ($img) { $img.Dispose() }
    }
}

$assetsDir = "dist/assets"
if (Test-Path $assetsDir) {
    Get-ChildItem -Path $assetsDir -Filter "*.jpg" | ForEach-Object {
        if ($_.Length -gt 1MB) {
            Write-Host "Compressing $($_.Name) ($([Math]::Round($_.Length/1MB, 2)) MB)..."
            Compress-Image -Path $_.FullName -Quality 75 -MaxWidth 1600
        }
    }
} else {
    Write-Host "dist/assets directory not found!"
}
