import { useMutation } from "@tanstack/react-query"

import { importarMetasPorItem } from "../services/metasImportacaoService"

export function useImportarMetas() {
  return useMutation({
    mutationFn: importarMetasPorItem,
  })
}
