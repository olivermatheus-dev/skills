// Coletores de concorrentes (stub — implementado na tarefa 018, frente "Concorrentes").
export interface CollectOptions { platforms?: string[]; maxItems?: number }
export async function collectCompetitor(_slug: string, _id: string, _opt: CollectOptions = {}): Promise<unknown> {
  throw new Error('coletor ainda não implementado');
}
