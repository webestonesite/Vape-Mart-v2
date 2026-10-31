/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";

export function SeoContent() {
  return (
    <section
      aria-label="About Vape Mart and vaping in the UAE"
      style={{ order: 998 }}
      className="relative w-full px-4 sm:px-6 md:px-8 py-10 sm:py-14"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="bg-white rounded-[24px] sm:rounded-[32px] border border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 sm:p-10 md:p-12">
          <div className="mt-10 first:mt-0">
            <span className="inline-block text-xs font-black tracking-[0.25em] text-[#064e3b] bg-emerald-50 border border-emerald-200/80 px-4 py-1.5 rounded-full uppercase mb-4">
              Vape Mart UAE
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#064e3b] mb-4">
              Buy Vapes in the UAE, Without the Guesswork
            </h2>
            <div className="space-y-4 text-neutral-600 leading-relaxed text-[15px] sm:text-base">
              <p>
                Shopping for a vape in the UAE should be simple. You want a genuine device, a flavour you
                actually like, and a price in dirhams that does not need converting in your head. That is
                what Vape Mart is built around. The shop serves vapers in Dubai and across the Emirates
                with a focused range: pod systems, heated tobacco, disposable vapes, and e-liquids from
                brands people already know and ask for by name. Every price on the site is in AED, and
                every product page shows what is in stock before you buy, so there are no surprises at
                checkout.
              </p>
              <p>
                Most people land here with one of three needs. Some want to switch from cigarettes and
                need something small and familiar. Some already vape and want their usual pods or a new
                flavour. And some just want a disposable for the weekend, with no charging and no
                refilling. The sections below explain each option in plain words.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#064e3b] mb-4">What You Will Find Here</h2>
            <div className="space-y-4 text-neutral-600 leading-relaxed text-[15px] sm:text-base">
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900">JUUL and JUUL 2 pods</h3>
              <p>
                JUUL is the pod system many vapers in the UAE start with, and for good reason. The device
                is small enough to disappear into a pocket, it has no buttons to learn, and the pods click
                in and out in seconds. JUUL 2 builds on the same idea with a wider pod range. On each JUUL
                product page you pick your flavour and nicotine strength from simple dropdowns, and the
                price and stock update to match the exact variant you chose. If you like tobacco or
                menthol, both are covered. If you prefer something colder or fruitier, the menthol and
                fruit ice pods are the ones people come back for.
              </p>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900">TEREA and IQOS heated tobacco</h3>
              <p>
                TEREA sticks are made for IQOS devices, and they suit smokers who want real tobacco taste
                without smoke, ash, or the smell that sticks to clothes. The stick heats the tobacco
                instead of burning it, and the device controls the temperature for you. If you already
                own an IQOS device, you only need the sticks. If you do not, the IQOS devices on the site
                pair with the full TEREA range, including the amber and menthol blends that sell the
                fastest. One thing to check before you order: TEREA sticks only work in IQOS devices, not
                in ordinary pod systems or disposables.
              </p>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900">Disposable vapes</h3>
              <p>
                Disposables are the easiest way to vape. There is nothing to charge, nothing to refill,
                and nothing to set up. You open the pack and use it until it is done. The range here runs
                from compact bars like the ELFBAR BC10000 up to large capacity devices like the Waka
                Blade 50K, with Al Fakher and KIEF King in between, so you can match the size to how much
                you actually vape. A smaller bar suits an occasional evening, a larger one suits a daily
                vaper. Flavours lean heavily
                toward fruit ice and menthol, with tobacco and dessert options for people who want
                something less sweet.
              </p>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900">E-liquids for refillable devices</h3>
              <p>
                If you already own a refillable device, the e-liquid shelf is where you get the most
                control. You choose the flavour family, and you choose how strong you want it. Fruit
                blends are the most popular, followed by menthol for a cold finish, classic tobacco for
                ex-smokers, and dessert blends for an evening vape. Because e-liquids are bought
                separately from hardware, they are also the cheapest way to try a new flavour.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4">Which vape fits you?</h3>
            <div className="overflow-x-auto rounded-2xl border border-neutral-200/80">
              <table className="min-w-full text-sm sm:text-[15px] text-left">
                <thead>
                  <tr className="bg-[#064e3b] text-white">
                    <th className="px-4 py-3 font-bold">Type</th>
                    <th className="px-4 py-3 font-bold">Good for</th>
                    <th className="px-4 py-3 font-bold">Start with</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-600">
                  <tr className="border-t border-neutral-200/70">
                    <td className="px-4 py-3 font-semibold text-[#064e3b]">Disposable vape</td>
                    <td className="px-4 py-3">No charging, no refilling, and no learning curve</td>
                    <td className="px-4 py-3">
                      <Link href="/collections/disposable-vape" className="text-[#064e3b] font-semibold underline underline-offset-2 hover:text-amber-600">
                        ELFBAR, Al Fakher, or Waka bars
                      </Link>
                    </td>
                  </tr>
                  <tr className="border-t border-neutral-200/70 bg-emerald-50/40">
                    <td className="px-4 py-3 font-semibold text-[#064e3b]">JUUL pod system</td>
                    <td className="px-4 py-3">A small daily device with prefilled pods</td>
                    <td className="px-4 py-3">JUUL or JUUL 2 pods in tobacco or menthol</td>
                  </tr>
                  <tr className="border-t border-neutral-200/70">
                    <td className="px-4 py-3 font-semibold text-[#064e3b]">TEREA heated tobacco</td>
                    <td className="px-4 py-3">Real tobacco taste for IQOS owners</td>
                    <td className="px-4 py-3">TEREA sticks in amber or menthol</td>
                  </tr>
                  <tr className="border-t border-neutral-200/70 bg-emerald-50/40">
                    <td className="px-4 py-3 font-semibold text-[#064e3b]">IQOS device</td>
                    <td className="px-4 py-3">Heated tobacco hardware, if you do not own one yet</td>
                    <td className="px-4 py-3">IQOS devices from the shop range</td>
                  </tr>
                  <tr className="border-t border-neutral-200/70">
                    <td className="px-4 py-3 font-semibold text-[#064e3b]">E-liquid</td>
                    <td className="px-4 py-3">Refillable devices and full control over flavour and strength</td>
                    <td className="px-4 py-3">A fruit, menthol, tobacco, or dessert blend</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#064e3b] mb-4">
              Nicotine Strengths and Flavours, in Plain Words
            </h2>
            <div className="space-y-4 text-neutral-600 leading-relaxed text-[15px] sm:text-base">
              <p>
                Strength is the part people overthink, so here is the simple version. Across the shop you
                will see strengths such as 20mg, 30mg, and 50mg on pods and disposables, with lighter
                options on some lines. If you smoked a pack a day, a higher strength usually feels right
                at first, because it matches what your body is used to. If you smoked lightly or you vape
                socially, a lower strength is the better starting point. You can always step down later.
                What matters most is that the strength feels satisfying without making you dizzy.
              </p>
              <p>
                Flavours fall into four families here: fruit ice, menthol, tobacco, and dessert. Fruit ice
                is sweet with a cold finish, and it dominates the disposable shelf. Menthol is clean and
                cold without sweetness. Tobacco is for people who want their vape to taste like what they
                left behind. Dessert blends taste like custard, vanilla, or baked sweets, and they suit
                evenings better than all-day use. If you are unsure, start with a tobacco or menthol
                option in a familiar strength, then branch into fruit ice once you know what your device
                feels like.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#064e3b] mb-4">How Ordering Works</h2>
            <div className="space-y-4 text-neutral-600 leading-relaxed text-[15px] sm:text-base">
              <p>
                Ordering takes a few minutes. Browse the{" "}
                <Link href="/collections" className="text-[#064e3b] font-semibold underline underline-offset-2 hover:text-amber-600">
                  collections
                </Link>{" "}
                or search for a brand, open the product, and pick your flavour and nicotine strength from
                the dropdowns. The price and stock shown always belong to the exact variant you selected,
                so what you see is what you pay. Then check out through the secure checkout, or if you
                would rather talk to a person first, the WhatsApp ordering option connects you with the
                shop team on +971 55 168 8299. Delivery runs across Dubai and the wider UAE, prices stay
                in AED from start to finish, and the shop backs orders with a 30-day money back promise.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#064e3b] mb-4">
              A Quick Word on Vaping Responsibly
            </h2>
            <div className="space-y-4 text-neutral-600 leading-relaxed text-[15px] sm:text-base">
              <p>
                Vapes are for adults only, and nicotine is addictive, so buy for yourself and keep
                devices and liquids away from children. If you do not smoke or vape already, there is no
                reason to start. If you are switching from cigarettes, choose a strength that keeps you
                off cigarettes rather than the strongest number on the page. And buy genuine products
                from a shop that stands behind them, because counterfeit pods and liquids are the one
                place where a cheap deal can cost you more than money.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#064e3b] mb-4">
              Questions Vapers in the UAE Ask
            </h2>
            <div className="space-y-4 text-neutral-600 leading-relaxed text-[15px] sm:text-base">
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900">Are the products genuine?</h3>
              <p>
                Yes. The shop presents itself as an authorized premium retailer, and the range is built on
                original brands with tamper-proof packaging. If a product ever arrives in a condition you
                do not trust, the 30-day money back promise is there for exactly that situation.
              </p>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900">Do you deliver outside Dubai?</h3>
              <p>
                Yes. Delivery runs across Dubai and the wider UAE, and checkout confirms availability for
                your address before you pay.
              </p>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900">How do I get help choosing?</h3>
              <p>
                Message the shop team on WhatsApp at +971 55 168 8299. Tell them what you smoke or vape
                now, what flavours you like, and what you want to spend, and they will point you to a
                device and strength that fit instead of the most expensive option.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
