import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

type CardProps = {
    fantasia: string,
    faturado: number,
    meta: number
}


export default function CardFornec({fantasia, faturado, meta}: CardProps) {
    const metaNaoAtingida = meta - faturado;

    return (
        <Card className="border-none flex-1">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">{ fantasia }</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
                <span className="font-bold">
                    { faturado.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                    }) }
                </span>
                <p className="text-xs text-muted-foreground">
                    {metaNaoAtingida > 0 ? (<>
                        <span>Restante{' '}</span>
                            <span className='text-white font-bold'>
                                {metaNaoAtingida.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                            }) }
                        </span>
                    </>) : <span style={{fontSize: '1.125rem'}}>&#x1F44D;</span>}
                    
                </p>
            </CardContent>
        </Card>
    )
}