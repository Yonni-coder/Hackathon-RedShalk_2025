// buildSampleData.js
export function buildSampleData({ bookings = [], resources = [] } = {}) {
  // 1) sampleBookings : on garde uniquement les champs utiles
  const sampleBookings = bookings.map(b => ({
    id: b.id,
    ressource_id: b.ressource_id,
    start_date: b.start_date,
    end_date: b.end_date,
  }));

  // 2) sampleResources :
  // - si resources fourni : on mappe et prend le tarif journalier quand présent
  // - sinon : on dérive une liste unique à partir des bookings (nom, id) sans tarif
  let sampleResources;
  if (Array.isArray(resources) && resources.length > 0) {
    sampleResources = resources.map(r => ({
      id: r.id,
      name: r.name ?? r.ressource_name ?? `Ressource ${r.id}`,
      tarifs: r.tarifs ?? { tarif_j: r.tarif_j ?? null },
    }));
  } else {
    // dériver depuis bookings : unique par ressource_id
    const map = new Map();
    for (const b of bookings) {
      const rid = Number(b.ressource_id);
      if (!map.has(rid)) {
        map.set(rid, {
          id: rid,
          name: b.ressource_name ?? `Ressource ${rid}`,
          tarifs: { tarif_j: null }, // pas d'info tarif dans bookings -- mettre null
        });
      }
    }
    sampleResources = Array.from(map.values());
  }

  return { sampleResources, sampleBookings };
}
