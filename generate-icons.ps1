Add-Type -AssemblyName System.Drawing

function New-Icon($size, $outputPath) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'HighQuality'
  $g.InterpolationMode = 'HighQualityBicubic'

  $white = [System.Drawing.Color]::FromArgb(255, 255, 255)
  $green = [System.Drawing.Color]::FromArgb(46, 204, 113)

  # White background
  $bgBrush = New-Object System.Drawing.SolidBrush($white)
  $g.FillRectangle($bgBrush, 0, 0, $size, $size)

  $s = [double]($size) / 100.0
  $gb = New-Object System.Drawing.SolidBrush($green)

  # Shopping cart body (basket)
  $pts = New-Object System.Drawing.PointF[] 4
  $pts[0] = New-Object System.Drawing.PointF ([float](27*$s)), ([float](38*$s))
  $pts[1] = New-Object System.Drawing.PointF ([float](73*$s)), ([float](38*$s))
  $pts[2] = New-Object System.Drawing.PointF ([float](78*$s)), ([float](66*$s))
  $pts[3] = New-Object System.Drawing.PointF ([float](22*$s)), ([float](66*$s))
  $g.FillPolygon($gb, $pts)

  # Handle
  $g.FillRectangle($gb, [float](27*$s), [float](24*$s), [float](5*$s), [float](14*$s))
  $g.FillRectangle($gb, [float](27*$s), [float](24*$s), [float](17*$s), [float](5*$s))

  # Wheels
  $g.FillEllipse($gb, [float]((30-6)*$s), [float]((70-6)*$s), [float](12*$s), [float](12*$s))
  $g.FillEllipse($gb, [float]((70-6)*$s), [float]((70-6)*$s), [float](12*$s), [float](12*$s))

  $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

  $gb.Dispose(); $bgBrush.Dispose()
  $g.Dispose(); $bmp.Dispose()
}

$root = "C:\Users\PEPELUIS\Desktop\apps\reco"
New-Icon 192 "$root\icon-192.png"
New-Icon 512 "$root\icon-512.png"
Write-Host "Iconos generados correctamente"
