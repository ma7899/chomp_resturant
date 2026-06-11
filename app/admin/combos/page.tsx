import { requireAdmin } from "@/lib/auth/session";
import { listCombos, suggestCombos } from "@/lib/server/combos";
import { getSandwiches } from "@/lib/server/catalog";
import CombosManager from "@/components/admin/CombosManager";

export const dynamic = "force-dynamic";

export default async function AdminCombosPage() {
  await requireAdmin();
  const [combos, sandwiches, suggestions] = await Promise.all([
    listCombos(),
    getSandwiches(),
    suggestCombos(5),
  ]);

  return (
    <CombosManager
      initial={combos.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        discountType: c.discountType,
        discountValue: c.discountValue,
        isActive: c.isActive,
        items: c.items.map((it) => ({
          sandwichId: it.sandwichId,
          quantity: it.quantity,
          name: it.sandwich.name,
          basePrice: it.sandwich.basePrice,
        })),
      }))}
      sandwiches={sandwiches.map((s) => ({
        id: s.id,
        name: s.name,
        basePrice: s.basePrice,
      }))}
      suggestions={suggestions.map((s) => ({
        names: s.names,
        count: s.count,
      }))}
    />
  );
}
