import source from './treatments.generated.json'

// Every CSV entry has its own English source artwork. Preserve Pages base URL.
export function treatmentImage(id: string) {
  const item = source.treatments.find((t) => t.id === id)
  return {
    src: item ? `${import.meta.env.BASE_URL}images/treatments/${item.image}` : undefined,
    position: item?.position ?? '50% 50%',
    scale: item?.scale ?? 1,
    fit: (item?.fit ?? 'cover') as 'contain' | 'cover',
  }
}
