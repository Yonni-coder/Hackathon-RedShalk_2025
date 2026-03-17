import { FooterData } from "@/types/types"

export async function getFooterData(): Promise<FooterData> {
    const res = await fetch("/data.json")
    if (!res.ok) throw new Error("Erreur lors du chargement des données footer")
    const json = await res.json()
    return json.footer as FooterData
}