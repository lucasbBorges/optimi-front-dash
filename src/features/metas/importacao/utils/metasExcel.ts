import * as XLSX from "xlsx"

import type {
  ErroImportacaoMeta,
  MetaItemImportado,
  ResumoImportacaoMetas,
} from "../types"

const requiredColumns = ["codprod", "qt", "vlr"] as const

type ImportedRow = Record<string, unknown> & {
  __rowNumber?: number
}

const templateFileName = "modelo_importacao_metas.xlsx"

export function gerarModeloImportacaoMetas() {
  const worksheet = XLSX.utils.aoa_to_sheet([[...requiredColumns]])
  worksheet["!cols"] = [{ wch: 14 }, { wch: 12 }, { wch: 14 }]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "metas")
  XLSX.writeFile(workbook, templateFileName)
}

export async function lerArquivoMetas(file: File): Promise<unknown[]> {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" })
  const firstSheetName = workbook.SheetNames[0]

  if (!firstSheetName) {
    return []
  }

  const worksheet = workbook.Sheets[firstSheetName]
  const sheetRows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    defval: "",
    raw: false,
    blankrows: true,
  })
  const headers = (sheetRows[0] ?? []).map((header) => String(header).trim())

  return sheetRows
    .slice(1)
    .map((cells, index) => toImportedRow(headers, cells, index + 2))
    .filter((row) => !isEmptyRow(row))
}

export function validarMetasImportadas(rows: unknown[]): {
  dadosValidos: MetaItemImportado[]
  erros: ErroImportacaoMeta[]
} {
  const erros: ErroImportacaoMeta[] = []
  const dadosValidos: MetaItemImportado[] = []
  const normalizedRows = rows.filter(isImportedRow)

  if (normalizedRows.length === 0) {
    return {
      dadosValidos,
      erros: [
        {
          linha: 1,
          mensagem: "O arquivo nao possui linhas validas para importacao.",
        },
      ],
    }
  }

  const headers = Object.keys(normalizedRows[0]).filter(
    (key) => key !== "__rowNumber"
  )
  const missingColumns = requiredColumns.filter(
    (column) => !headers.includes(column)
  )

  if (missingColumns.length > 0) {
    return {
      dadosValidos,
      erros: [
        {
          linha: 1,
          mensagem:
            "O arquivo deve conter as colunas obrigatorias: codprod, qt e vlr.",
        },
      ],
    }
  }

  normalizedRows.forEach((row) => {
    const line = row.__rowNumber ?? 1
    const rowErrors = validateRow(row, line)

    if (rowErrors.length > 0) {
      erros.push(...rowErrors)
      return
    }

    dadosValidos.push({
      codprod: Number(row.codprod),
      qt: Number(row.qt),
      vlr: roundCurrency(Number(row.vlr)),
    })
  })

  return { dadosValidos, erros }
}

export function calcularResumoMetas(
  dados: MetaItemImportado[]
): ResumoImportacaoMetas {
  const totalQuantidade = dados.reduce((total, item) => total + item.qt, 0)
  const totalValorInCents = dados.reduce(
    (total, item) => total + Math.round(item.vlr * 100),
    0
  )

  return {
    totalItens: dados.length,
    totalQuantidade,
    totalValor: totalValorInCents / 100,
  }
}

function isImportedRow(row: unknown): row is ImportedRow {
  return typeof row === "object" && row !== null
}

function toImportedRow(headers: string[], cells: unknown[], rowNumber: number) {
  return headers.reduce<ImportedRow>(
    (row, header, index) => {
      if (header) {
        row[header] = cells[index] ?? ""
      }

      return row
    },
    { __rowNumber: rowNumber }
  )
}

function isEmptyRow(row: ImportedRow) {
  return Object.entries(row).every(
    ([key, value]) => key === "__rowNumber" || isEmptyValue(value)
  )
}

function validateRow(row: ImportedRow, line: number) {
  const errors: ErroImportacaoMeta[] = []

  requiredColumns.forEach((column) => {
    if (isEmptyValue(row[column])) {
      errors.push({
        linha: line,
        campo: column,
        mensagem: `${column} e obrigatorio.`,
      })
    }
  })

  if (!isEmptyValue(row.codprod) && !isIntegerValue(row.codprod)) {
    errors.push({
      linha: line,
      campo: "codprod",
      mensagem: "codprod deve ser um numero inteiro.",
    })
  }

  if (!isEmptyValue(row.qt) && !isIntegerValue(row.qt)) {
    errors.push({
      linha: line,
      campo: "qt",
      mensagem: "qt deve ser um numero inteiro.",
    })
  }

  if (!isEmptyValue(row.vlr) && !isDecimalWithTwoPlaces(row.vlr)) {
    errors.push({
      linha: line,
      campo: "vlr",
      mensagem: "vlr deve possuir no maximo 2 casas decimais.",
    })
  }

  return errors
}

function isEmptyValue(value: unknown) {
  return value === null || value === undefined || String(value).trim() === ""
}

function normalizeNumberText(value: unknown) {
  return String(value).trim().replace(",", ".")
}

function isIntegerValue(value: unknown) {
  const normalized = normalizeNumberText(value)
  return /^-?\d+$/.test(normalized) && Number.isInteger(Number(normalized))
}

function isDecimalWithTwoPlaces(value: unknown) {
  const normalized = normalizeNumberText(value)
  return /^\d+(\.\d{1,2})?$/.test(normalized) && Number.isFinite(Number(normalized))
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100
}
