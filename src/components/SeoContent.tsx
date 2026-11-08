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
                Shopping for a vape in the UAE should be simple. You want a genuine device, a flavour
                you actually like, and a clear price in AED with no need to work it out in your head.
                That is what Vape Mart is built around. As the best vape shop in Dubai for online
                orders, Vape Mart serves Dubai, Sharjah, Ajman and Abu Dhabi with a focused range of
                pod systems, heated tobacco, disposable vapes and e-liquids from famous brands. Every
                price is in dirhams, and every product page shows stock for the exact option you pick,
                so there are no surprises at checkout.
              </p>
              <p>
                Most shoppers come here for one of three reasons. Some are switching from cigarettes
                and want something small and familiar. Some already vape and want their usual pods or a
                new flavour to try. And some just want a disposable for the weekend, with no charging
                and no refilling. The sections below explain each option in plain words.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#064e3b] mb-4">What You Will Find Here</h2>
            <div className="space-y-4 text-neutral-600 leading-relaxed text-[15px] sm:text-base">
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900">JUUL and JUUL 2 pods</h3>
              <p>
                JUUL is where many vapers in the UAE start, because it keeps things simple. The device
                is small enough to fit in your pocket, it has no buttons to learn, and the pods click
                in and out in seconds. JUUL 2 builds on the same idea with a wider pod range to choose
                from. When you buy JUUL online in the UAE from Vape Mart, the best JUUL shop in Dubai
                for starter kits and pods, you pick your flavour and nicotine strength from simple
                options and the price and stock update to match the exact one you chose. Tobacco and
                menthol are covered, with JUUL Virginia Tobacco and Mint pods still the classics, while
                the fruit ice pods are the ones people reorder most. You will find JUUL salt nicotine
                pods in 3% and 5% and also in 18 mg, along with an authentic JUUL starter kit if you
                are starting from scratch.
              </p>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900">TEREA and IQOS heated tobacco</h3>
              <p>
                TEREA sticks are made for IQOS and Lambda devices. Lambda is a third-party device for
                TEREA sticks. They suit smokers who want the real tobacco taste without smoke, ash or
                the smell that clings to clothes. The device heats, rather than burns the tobacco and
                controls the temperature for you. If you already have an IQOS, you just need TEREA
                sticks. If you don&apos;t, you can buy IQOS ILUMA in Dubai at Vape Mart, along with the
                whole line of TEREA sticks, including TEREA Bronze, TEREA Sienna, TEREA Silver, and
                menthol alternatives like TEREA Fusion Menthol. That is why so many customers describe
                Vape Mart as the greatest TEREA store in Dubai and the best IQOS shop in Dubai, with
                the best, original TEREA sticks in the UAE and TEREA delivery throughout Dubai and the
                Emirates.
              </p>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900">Disposable vapes</h3>
              <p>
                Disposables are the easiest way to vape. There&apos;s nothing to charge, nothing to top
                up, nothing to wait for, so open the box, use the lot. The selection ranges from small
                bars, like the ELFBAR BC10000, to the giant, powerful Waka Blade 50K, with Al Fakher
                and KIEF King filling in the middle so you can choose the size to how much you actually
                vape. A smaller bar for an occasional evening, a larger one for a daily vaper. As a
                disposable vape shop in Dubai, Vape Mart also offers cash on delivery on eligible
                orders, at some of the best vape prices in the UAE.
              </p>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900">E-liquids for refillable devices</h3>
              <p>
                If you already own a refillable device, e-liquids give you the most control. You
                choose the flavour family and you choose how strong you want it. Fruit blends are the
                most popular, followed by menthol for a cold finish, classic tobacco for ex-smokers,
                and dessert blends for an evening vape. Because e-liquids are bought separately from
                hardware, they are also the cheapest way to try a new flavour, and you will often catch
                vape juice offers online here that make trying something new a lot easier.
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
                    <td className="px-4 py-3">No refilling, and no learning curve</td>
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
                Strength is the part people overthink, so here is the simple version. Across the shop
                you will see strengths such as 20mg, 30mg and 50mg on pods and disposables, with
                lighter options on some lines. If you smoke a pack a day, a higher strength usually
                feels right at first because it matches what your body is used to. If you smoke lightly
                or you vape socially, a lower strength is the better starting point, and you can always
                step down later. What matters most is that the strength feels satisfying without making
                you dizzy.
              </p>
              <p>
                Flavours fall into four families here: fruit ice, menthol, tobacco and dessert. Fruit
                ice is sweet with a cold finish and it dominates the disposable shelf. Menthol is clean
                and cold without sweetness. Tobacco is for people who want their vape to taste like what
                they left behind. Dessert blends taste like custard, vanilla or baked sweets, and they
                suit evenings better than all-day use. If you are unsure, start with a tobacco or
                menthol option in a familiar strength, then branch into fruit ice once you know what
                your device feels like.
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
                or search for a brand, open the product, and pick your flavour and nicotine strength.
                The price and stock shown always belong to the exact option you selected, so what you
                see is what you pay. Then check out using secure checkout, pay on delivery when
                available, or if you prefer to chat to someone first, order your vape via WhatsApp.
                Delivery runs across Dubai and the wider UAE, and prices stay in AED from start to
                finish. Orders are also backed by a 30-day money back promise.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#064e3b] mb-4">
              A Quick Word on Vaping Responsibly
            </h2>
            <div className="space-y-4 text-neutral-600 leading-relaxed text-[15px] sm:text-base">
              <p>
                Nicotine is addictive, so buy for yourself and keep devices and liquids away from
                youngsters. If you don&apos;t already smoke or vape, there&apos;s no need to start. If
                you are transitioning from cigarettes, select a strength that will keep you from
                smoking rather than the strongest number on the page. Also, get authentic products from
                a shop that stands behind them, because counterfeit pods and liquids are the one area
                where a cheap deal can cost you more than money.
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
                Yes. The shop presents itself as an authorized retailer, and the range is built on
                original brands with tamper-proof packaging. If a product ever arrives in a condition
                you don&apos;t trust, the 30-day money back promise is there for exactly that
                situation.
              </p>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900">Do you deliver outside Dubai?</h3>
              <p>
                Yes. Vape delivery in Dubai is the core, but delivery also runs across the wider UAE,
                including Sharjah, Ajman and Abu Dhabi, and checkout confirms availability for your
                address before you pay.
              </p>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900">How do I get help choosing?</h3>
              <p>
                Chat the shop team WhatsApp at +971 55 110 3401. Let them know what flavours
                you&apos;re into and they&apos;ll find you a device and strength that&apos;s suitable
                for you rather than the most expensive.
              </p>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900">Can I pay on delivery?</h3>
              <p>
                Yes, cash on delivery is available on eligible orders. Checkout will confirm it for
                your address before you pay. You can also pay online in AED through secure checkout if
                you prefer to pay in advance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
