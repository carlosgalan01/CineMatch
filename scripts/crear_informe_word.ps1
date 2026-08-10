param(
    [string]$Origen = (Join-Path $PSScriptRoot '..\notebooks\Informe_Caso_Practico_RS_Carlos_Galan.md'),
    [string]$Salida = (Join-Path $PSScriptRoot '..\notebooks\Informe_Caso_Practico_RS_Carlos_Galan.docx')
)

$ErrorActionPreference = 'Stop'
$origenResuelto = [System.IO.Path]::GetFullPath($Origen)
$salidaResuelta = [System.IO.Path]::GetFullPath($Salida)
$word = $null
$documento = $null

try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $documento = $word.Documents.Add()

    # Formato compacto para que el informe final no supere dos páginas.
    $documento.PageSetup.PageWidth = 595.3
    $documento.PageSetup.PageHeight = 841.9
    $documento.PageSetup.TopMargin = 51
    $documento.PageSetup.BottomMargin = 51
    $documento.PageSetup.LeftMargin = 55
    $documento.PageSetup.RightMargin = 55

    $normal = $documento.Styles.Item(-1)
    $normal.Font.Name = 'Aptos'
    $normal.Font.Size = 10
    $normal.ParagraphFormat.Alignment = 3
    $normal.ParagraphFormat.SpaceAfter = 4
    $normal.ParagraphFormat.LineSpacingRule = 0

    $titulo = $documento.Styles.Item(-63)
    $titulo.Font.Name = 'Aptos Display'
    $titulo.Font.Size = 19
    $titulo.Font.Bold = $true
    $titulo.Font.Color = 0x734F33
    $titulo.ParagraphFormat.SpaceAfter = 5

    $encabezado = $documento.Styles.Item(-2)
    $encabezado.Font.Name = 'Aptos Display'
    $encabezado.Font.Size = 12.5
    $encabezado.Font.Bold = $true
    $encabezado.Font.Color = 0x734F33
    $encabezado.ParagraphFormat.SpaceBefore = 7
    $encabezado.ParagraphFormat.SpaceAfter = 3

    $contenido = Get-Content -Raw -Encoding UTF8 -LiteralPath $origenResuelto
    $bloques = [regex]::Split($contenido.Trim(), '(?:\r?\n){2,}')
    $tituloInsertado = $false
    $seleccion = $word.Selection
    $firma = [string]::Concat(
        'Carlos Gal', [char]0x00E1, 'n ', [char]0x00B7,
        ' M', [char]0x00E1, 'ster IEP'
    )

    foreach ($bloque in $bloques) {
        $texto = $bloque.Trim()
        if (-not $texto) { continue }

        if ($texto.StartsWith('# ')) {
            $seleccion.Style = -63
            $seleccion.TypeText($texto.Substring(2))
            $seleccion.TypeParagraph()
            $tituloInsertado = $true

            $seleccion.Style = -1
            $seleccion.Font.Name = 'Aptos'
            $seleccion.Font.Size = 9.5
            $seleccion.Font.Color = 0x777777
            $seleccion.ParagraphFormat.SpaceAfter = 8
            $seleccion.TypeText($firma)
            $seleccion.TypeParagraph()
        }
        elseif ($texto.StartsWith('## ')) {
            $seleccion.Style = -2
            $seleccion.TypeText($texto.Substring(3))
            $seleccion.TypeParagraph()
        }
        else {
            $textoLimpio = ($texto -replace '\r?\n', ' ' -replace '[`*]', '')
            $seleccion.Style = -1
            $seleccion.TypeText($textoLimpio)
            $seleccion.TypeParagraph()
        }
    }

    if (-not $tituloInsertado) {
        throw 'El informe no contiene un título Markdown de nivel 1.'
    }

    $pie = $documento.Sections.Item(1).Footers.Item(1).Range
    $pie.Text = [string]::Concat(
        'Carlos Gal', [char]0x00E1, 'n ', [char]0x00B7,
        ' Caso Pr', [char]0x00E1, 'ctico 1     '
    )
    $pie.Font.Name = 'Aptos'
    $pie.Font.Size = 8
    $pie.Font.Color = 0x888888
    $pie.ParagraphFormat.Alignment = 2
    $pie.Fields.Add($pie, -1, 'PAGE', $true) | Out-Null

    $documento.Repaginate()
    $paginas = $documento.ComputeStatistics(2)
    if ($paginas -gt 2) {
        throw "El informe ocupa $paginas páginas; el máximo permitido es 2."
    }

    $documento.SaveAs2($salidaResuelta, 16)
    Write-Output "Informe generado: $salidaResuelta"
    Write-Output "Páginas: $paginas"
}
finally {
    if ($documento) {
        $documento.Close($false)
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($documento) | Out-Null
    }
    if ($word) {
        $word.Quit()
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
    }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
