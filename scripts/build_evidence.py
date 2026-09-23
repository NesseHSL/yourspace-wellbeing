import html, json, os

B = "https://www.yourspacewellbeing.com"
OUT = os.path.expanduser("~/Desktop/YourSpace/evidence")
DATE = "2026-09-23"
DRAFT = True  # noindex until Hillary approves

ARTICLES = [
 {
  "slug": "vitamin-d-depression",
  "claim": "Vitamin D cures depression",
  "title": "Does vitamin D cure depression? What the evidence says",
  "desc": "Does vitamin D cure or prevent depression? We weigh the large randomised trials and meta-analyses: what vitamin D can and can't do for mood.",
  "verdict": "RED",
  "short": "No. Vitamin D does not cure depression, and a very large trial found it does not prevent it either. There is some evidence it may modestly ease symptoms in people who are already depressed, especially if they are low in vitamin D, but it is not a replacement for proper treatment.",
  "sections": [
   ("Where the claim comes from", [
     "People with depression tend to have lower vitamin D levels than people without it, and low mood is more common in winter, when we make less vitamin D from sunlight. That link is real, but it is an association. It could also run the other way: people who feel low tend to go outside less, which lowers vitamin D."]),
   ("What the strongest evidence shows", [
     "The best test of cause and effect is a randomised controlled trial. The largest on this question, VITAL-DEP, gave 18,353 adults aged 50 and over either 2,000 IU of vitamin D3 a day or a placebo for around five years. Rates of depression were almost identical in both groups, and mood scores did not differ.",
     "Meta-analyses that pool many smaller trials tell a slightly different story. They find a small to moderate improvement in depressive symptoms with vitamin D, and the effect is clearest in people who already have depression and, in some analyses, at higher daily doses. But these trials are often small, short and quite different from one another, which lowers confidence in the size of the effect."]),
   ("The honest summary", [
     "Vitamin D does not prevent depression in the general population, and there is no evidence it cures it. It may help a little as an add-on for some people with depression, particularly if they are deficient. If you are low in vitamin D, correcting it is worthwhile for many reasons. If you are struggling with your mood, please speak to your GP rather than relying on a supplement."]),
  ],
  "sources": [
   ("Okereke et al. (2020), JAMA. VITAL-DEP randomised trial, 18,353 adults", "https://psychiatryonline.org/doi/10.1176/appi.pn.2020.9a25"),
   ("Systematic review and dose-response meta-analysis of randomised trials (2024), Psychological Medicine", "https://www.cambridge.org/core/journals/psychological-medicine/article/effect-of-vitamin-d-supplementation-on-depression-a-systematic-review-and-doseresponse-metaanalysis-of-randomized-controlled-trials/8F18452740B621CC04F441F037A2513B"),
   ("Meta-analysis of randomised trials in patients diagnosed with depression (2026), Frontiers in Nutrition", "https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2026.1772451/full"),
  ],
 },
 {
  "slug": "seed-oils",
  "claim": "Seed oils are toxic",
  "title": "Are seed oils toxic? What the evidence says",
  "desc": "Are seed oils like sunflower and rapeseed oil toxic or inflammatory? We weigh the cohort studies and randomised trials on omega-6 fats and heart health.",
  "verdict": "RED",
  "short": "No. The best available evidence does not show that seed oils such as sunflower, rapeseed or soybean oil are toxic. Higher intakes of linoleic acid, their main fat, are linked with a lower risk of heart disease, not a higher one.",
  "sections": [
   ("Where the claim comes from", [
     "Seed oils are rich in linoleic acid, an omega-6 fat. The worry is that omega-6 fats promote inflammation, that the oils are heavily processed, and that they create harmful compounds when heated. Some of these ideas start from real biochemistry, but the leap from a lab mechanism to 'toxic' in a normal diet is where the claim breaks down."]),
   ("What the strongest evidence shows", [
     "Large studies that follow people for years consistently link higher linoleic acid intake with a lower risk of coronary heart disease. A 2014 meta-analysis of 13 cohort studies (over 310,000 people) found this in a dose-response pattern. A 2019 analysis of 30 cohort studies, using blood markers of linoleic acid rather than food questionnaires, found higher levels were associated with lower risk of cardiovascular disease, cardiovascular death and stroke.",
     "Randomised trials are more mixed. A 2018 Cochrane review found that increasing omega-6 fats probably makes little or no difference to deaths or overall cardiovascular events, with a possible small reduction in heart attacks. Importantly, neither the trials nor the cohort studies show the harm that the 'toxic' claim implies. Blood markers of inflammation do not reliably rise with higher linoleic acid intake."]),
   ("The honest summary", [
     "Seed oils are not toxic. Swapping butter and other saturated fats for seed oils is, if anything, linked with better heart health. It is still sensible not to rely on deep-fried and ultra-processed food, but that is about the food, not the oil it happens to contain."]),
  ],
  "sources": [
   ("Farvid et al. (2014), Circulation. Meta-analysis of 13 prospective cohort studies", "https://www.ahajournals.org/doi/10.1161/circulationaha.114.010236"),
   ("Marklund et al. (2019), Circulation. Pooled analysis of 30 cohort studies using biomarkers", "https://www.ahajournals.org/doi/10.1161/CIRCULATIONAHA.118.038908"),
   ("Hooper et al. (2018), Cochrane review. Omega-6 fats for preventing cardiovascular disease", "https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD011094.pub4/full"),
   ("American Heart Association (2019). Omega-6 fatty acids and cardiovascular disease", "https://www.ahajournals.org/doi/10.1161/CIRCULATIONAHA.119.040331"),
  ],
 },
 {
  "slug": "magnesium-anxiety",
  "claim": "Magnesium reduces anxiety",
  "title": "Does magnesium reduce anxiety? What the evidence says",
  "desc": "Can magnesium supplements reduce anxiety or stress? We look at the systematic review evidence, who it might help, and how much confidence it deserves.",
  "verdict": "AMBER",
  "short": "Possibly, for some people, but the evidence is weak. A systematic review found hints of a benefit in people prone to anxiety, including mild anxiety and premenstrual symptoms, but the studies were generally small and of poor quality.",
  "sections": [
   ("Where the claim comes from", [
     "Magnesium is involved in the body's stress response and nervous system signalling, and low magnesium has been linked with anxiety in animal studies. Many people also don't get enough magnesium from their diet. That makes it a plausible idea, which is why it is so widely repeated."]),
   ("What the strongest evidence shows", [
     "The most cited systematic review, from the University of Leeds in 2017, found 18 studies of magnesium supplementation and anxiety or stress. Its conclusion was that the evidence is suggestive of a beneficial effect in anxiety-vulnerable groups, such as people with mild anxiety or premenstrual symptoms, but that the quality of the evidence is poor.",
     "Common problems included small sample sizes, short durations, different forms and doses of magnesium, supplements that combined magnesium with other ingredients, and a reliance on self-reported anxiety. There is no strong evidence of benefit for people who are not anxiety-prone or who already get enough magnesium."]),
   ("The honest summary", [
     "Magnesium might take the edge off mild anxiety for some people, and it is generally safe at normal doses for healthy adults. But it is not a proven anxiety treatment. Leafy greens, nuts, seeds and wholegrains are good food sources. If anxiety is affecting your daily life, please speak to your GP, as there are treatments with much stronger evidence behind them."]),
  ],
  "sources": [
   ("Boyle, Lawton and Dye (2017), Nutrients. Systematic review of magnesium and subjective anxiety and stress", "https://pubmed.ncbi.nlm.nih.gov/28445426/"),
  ],
 },
 {
  "slug": "collagen-skin",
  "claim": "Collagen supplements improve skin",
  "title": "Do collagen supplements improve your skin? What the evidence says",
  "desc": "Do collagen supplements reduce wrinkles or improve skin? The evidence looks positive until you separate independent trials from industry-funded ones.",
  "verdict": "AMBER",
  "short": "Unproven. Pooled trials look positive for skin hydration and elasticity, but a 2025 meta-analysis found the benefit disappears in independent, high-quality trials. The positive results come mainly from studies funded by the collagen industry.",
  "sections": [
   ("Where the claim comes from", [
     "Collagen gives skin its structure, and we make less of it as we age. The idea is that eating collagen peptides gives the body the building blocks, or signals, to make more. Collagen is broken down into amino acids and small peptides when we digest it, so whether it reaches the skin in a useful form has always been the key question."]),
   ("What the strongest evidence shows", [
     "Earlier meta-analyses pooled all the available trials and found improvements in skin hydration and elasticity. A 2023 review of 26 trials reached that conclusion.",
     "A 2025 meta-analysis in the American Journal of Medicine looked at 23 randomised trials with 1,474 participants, and this time split them by who paid for the study and how well it was designed. Trials funded by the industry showed benefits. Trials without industry funding, and the highest-quality trials, showed no significant effect on hydration, elasticity or wrinkles. The authors concluded there is currently no clinical evidence to support collagen supplements for preventing or treating skin ageing. Industry groups have disputed this interpretation."]),
   ("The honest summary", [
     "Collagen supplements are unlikely to harm you, but the case that they visibly improve skin rests mostly on industry-funded research. Sunscreen, not smoking, and topical retinoids have much stronger evidence for skin ageing. If you enjoy your collagen, it is a personal choice, just know the evidence is far weaker than the marketing."]),
  ],
  "sources": [
   ("Myung and Park (2025), The American Journal of Medicine. Meta-analysis of 23 randomised trials", "https://www.amjmed.com/article/S0002-9343(25)00283-9/abstract"),
   ("Industry response to the 2025 meta-analysis, NutraIngredients", "https://www.nutraingredients.com/Article/2025/08/26/industry-reacts-to-meta-analysis-concluding-collagen-supplements-show-no-proven-benefit-for-skin-aging/"),
  ],
 },
 {
  "slug": "creatine-women",
  "claim": "Women should take creatine for strength",
  "title": "Should women take creatine for strength? What the evidence says",
  "desc": "Does creatine help women build strength, or boost brain function? What randomised trials show for younger and older women who strength train.",
  "verdict": "AMBER",
  "short": "It depends on your age and goals. Alongside strength training, creatine has good evidence for improving strength in older women over several months. In women under 50, trials so far show no significant extra strength gain beyond training alone. Brain-boosting claims are not yet supported.",
  "sections": [
   ("Where the claim comes from", [
     "Creatine is one of the best-studied supplements in sport. It increases the energy available for short, intense efforts, which can let you do a little more work in each session. Most of the early research was in young men, and recent social media has pushed it to women for strength, menopause and brain health."]),
   ("What the strongest evidence shows", [
     "A 2024 meta-analysis of creatine plus resistance training in adults under 50 found that men gained significantly more upper and lower-body strength with creatine, but women did not show a significant additional gain. There are fewer trials in women, so this may partly reflect limited data rather than a true lack of effect.",
     "In older women the picture is more encouraging. A 2021 meta-analysis found creatine plus resistance training improved upper-body strength, and in trials lasting at least 24 weeks, both upper and lower-body strength improved compared with placebo.",
     "For brain function, the evidence is not there yet. In 2024 the European Food Safety Authority reviewed the trials and concluded that a claim that creatine improves cognitive function could not be substantiated."]),
   ("The honest summary", [
     "Creatine is not magic, and it works alongside training, not instead of it. For women over 50 doing regular strength work, it has reasonable evidence and a good safety record at standard doses. For younger women, the benefit over training alone is unproven. Skip it if the main reason is brain health. If you have kidney problems, check with your GP first."]),
  ],
  "sources": [
   ("Systematic review and meta-analysis of creatine and resistance training in adults under 50 (2024)", "https://pubmed.ncbi.nlm.nih.gov/39519498/"),
   ("Systematic review and meta-analysis of creatine and resistance training in older females (2021), Nutrients", "https://doaj.org/article/872d75609f6b42d499494c6ff86c780a"),
   ("European Food Safety Authority (2024). Creatine and improvement in cognitive function", "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2024.9100"),
  ],
 },
]

LABEL = {"GREEN": "Green", "AMBER": "Amber", "RED": "Red", "GREY": "Grey"}
VMEAN = {"GREEN": "Supported by strong evidence", "AMBER": "Mixed or weak evidence", "RED": "Not supported by the evidence", "GREY": "Not enough evidence"}

e = lambda s: html.escape(s, quote=True)

HEAD_CSS = """
.ev-main{max-width:680px;margin:0 auto;padding:56px 24px 100px}
.ev-back{display:inline-flex;gap:6px;font-size:13px;color:var(--muted);text-decoration:none;margin-bottom:40px}
.ev-back:hover{color:var(--navy)}
.ev-claim{font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:20px;color:var(--muted);margin-bottom:10px}
.ev-verdict{display:flex;align-items:center;gap:12px;margin:22px 0 28px}
.ev-verdict-text{font-size:13px;color:var(--muted)}
.ev-short{background:var(--teal-light);border:1px solid #B8DDE2;border-radius:12px;padding:22px 26px;margin-bottom:44px}
.ev-short h2{font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:var(--teal);font-weight:500;margin-bottom:10px;font-family:inherit}
.ev-short p{font-size:16px;line-height:1.8;color:var(--navy)}
.ev-h2{font-family:'Cormorant Garamond',Georgia,serif;font-size:26px;font-weight:400;color:var(--navy);line-height:1.3;margin:40px 0 16px}
.ev-p{font-size:15px;line-height:1.85;color:var(--text);margin-bottom:16px}
.ev-sources{list-style:none;padding:0;margin:0}
.ev-sources li{font-size:14px;line-height:1.7;padding:10px 0;border-bottom:1px solid var(--border)}
.ev-sources a{color:var(--teal);text-decoration:none}
.ev-sources a:hover{text-decoration:underline}
.ev-cta{margin-top:48px;padding:26px;border:1px solid var(--border);border-radius:12px;text-align:center}
.ev-cta p{font-size:15px;color:var(--text);margin-bottom:14px}
.ev-btn{display:inline-block;background:var(--navy);color:#fff;text-decoration:none;padding:12px 26px;border-radius:40px;font-size:14px}
.ev-btn:hover{background:var(--teal)}
.ev-disclaimer{background:#F8F9FB;border:1px solid var(--border);border-radius:12px;padding:20px 24px;margin-top:40px}
.ev-disclaimer p{font-size:13px;line-height:1.75;color:var(--muted)}
.ev-meta{font-size:12px;color:var(--muted);margin-top:8px}
.ev-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:14px}
.ev-card{display:block;border:1px solid var(--border);border-radius:14px;padding:22px 24px;text-decoration:none;transition:border-color .2s,box-shadow .2s}
.ev-card:hover{border-color:var(--teal);box-shadow:0 4px 18px rgba(28,52,97,.08)}
.ev-card .v-badge{display:inline-flex}
.ev-card h2{font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;font-weight:400;color:var(--navy);margin:10px 0 6px}
.ev-card p{font-size:14px;line-height:1.7;color:var(--muted)}
@media(max-width:480px){.ev-main{padding:40px 16px 80px}.ev-h2{font-size:22px}}
"""

FOOT = """  <div class="hcc-footer-links">
    <a href="/">← YourSpace</a>
    <span>·</span>
    <a href="/health-claim-checker">Check a claim</a>
    <span>·</span>
    <a href="/evidence">Evidence library</a>
    <span>·</span>
    <a href="/health-claim-checker-how-it-works">How it works</a>
  </div>"""

def head(title, desc, url, ld, ogtype="article"):
    robots = '\n<meta name="robots" content="noindex">' if DRAFT else ""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">{robots}
<title>{e(title)} | YourSpace Wellbeing</title>
<link rel="canonical" href="{url}">
<meta name="description" content="{e(desc)}">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:type" content="{ogtype}">
<meta property="og:site_name" content="YourSpace Wellbeing">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<link rel="icon" type="image/png" href="/assets/yourspace-favicon.png">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/health-claim-checker.css">
<style>{HEAD_CSS}</style>
</head>
<body>
<div class="hcc-topbar">
  <a href="/" class="hcc-topbar-logo"><img src="/assets/yourspace-logo-nostrap.png" alt="YourSpace Wellbeing"></a>
</div>
"""

ORG = {"@type": "Organization", "name": "YourSpace Wellbeing", "url": B + "/", "parentOrganization": {"@type": "Organization", "name": "HerSpace London", "url": "https://www.herspaceldn.com/"}}

def badge(v):
    return f'<div class="v-badge v-{v}"><div class="v-dot"></div><span>{LABEL[v]}</span></div>'

os.makedirs(OUT, exist_ok=True)
for a in ARTICLES:
    url = f"{B}/evidence/{a['slug']}"
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "Article", "headline": a["title"], "description": a["desc"], "datePublished": DATE, "dateModified": DATE,
         "author": ORG, "publisher": ORG, "mainEntityOfPage": url,
         "citation": [s[1] for s in a["sources"]]},
        {"@type": "ClaimReview", "url": url, "claimReviewed": a["claim"], "datePublished": DATE, "author": ORG,
         "reviewRating": {"@type": "Rating", "alternateName": f"{LABEL[a['verdict']]}: {VMEAN[a['verdict']]}"}},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "YourSpace", "item": B + "/"},
            {"@type": "ListItem", "position": 2, "name": "Evidence library", "item": B + "/evidence"},
            {"@type": "ListItem", "position": 3, "name": a["claim"], "item": url}]}]}
    body = [head(a["title"], a["desc"], url, ld), '<main class="ev-main">',
            '  <a class="ev-back" href="/evidence">← Evidence library</a>',
            '  <div class="eyebrow">Health claim, checked</div>',
            f'  <p class="ev-claim">&ldquo;{e(a["claim"])}&rdquo;</p>',
            f'  <h1 class="page-title">{e(a["title"])}</h1>',
            f'  <div class="ev-verdict">{badge(a["verdict"])}<span class="ev-verdict-text">{VMEAN[a["verdict"]]}</span></div>',
            f'  <section class="ev-short"><h2>The short answer</h2><p>{e(a["short"])}</p></section>']
    for h, ps in a["sections"]:
        body.append(f'  <h2 class="ev-h2">{e(h)}</h2>')
        body += [f'  <p class="ev-p">{e(p)}</p>' for p in ps]
    body.append('  <h2 class="ev-h2">Sources</h2>\n  <ul class="ev-sources">')
    body += [f'    <li><a href="{u}" target="_blank" rel="noopener">{e(t)}</a></li>' for t, u in a["sources"]]
    body.append('  </ul>')
    body.append(f'  <p class="ev-meta">Last reviewed {DATE[8:].lstrip("0")} September 2026 by the YourSpace Wellbeing team.</p>')
    body.append('  <div class="ev-cta"><p>Heard a different health claim? Check it against the research in seconds.</p><a class="ev-btn" href="/health-claim-checker">Check a claim</a></div>')
    body.append('  <div class="ev-disclaimer"><p><strong>Not medical advice.</strong> This article summarises published research for general education. It is not a diagnosis or a treatment recommendation. Always speak to a qualified healthcare professional about your own health.</p></div>')
    body.append(FOOT)
    body.append('</main>\n</body>\n</html>\n')
    open(f"{OUT}/{a['slug']}.html", "w").write("\n".join(body))

# index
url = B + "/evidence"
idesc = "Popular health and nutrition claims, checked against peer-reviewed research. Plain-English verdicts on supplements, diet trends and wellness advice from YourSpace Wellbeing."
ld = {"@context": "https://schema.org", "@type": "CollectionPage", "name": "Evidence library", "url": url, "description": idesc, "publisher": ORG,
      "hasPart": [{"@type": "Article", "headline": a["title"], "url": f"{B}/evidence/{a['slug']}"} for a in ARTICLES]}
body = [head("Evidence library: health claims, checked", idesc, url, ld, "website"), '<main class="ev-main">',
        '  <div class="eyebrow">Evidence library</div>',
        '  <h1 class="page-title">Health claims,<br>checked</h1>',
        '  <p class="page-sub">The health and nutrition claims we hear most, weighed against the best available research: systematic reviews and randomised trials first, headlines last.</p>',
        '  <ul class="ev-list">']
for a in ARTICLES:
    body.append(f'    <li><a class="ev-card" href="/evidence/{a["slug"]}">{badge(a["verdict"])}<h2>{e(a["title"])}</h2><p>{e(a["short"])}</p></a></li>')
body.append('  </ul>')
body.append('  <div class="ev-cta"><p>Don&rsquo;t see your claim here?</p><a class="ev-btn" href="/health-claim-checker">Check any claim</a></div>')
body.append(FOOT)
body.append('</main>\n</body>\n</html>\n')
open(f"{OUT}/index.html", "w").write("\n".join(body))
print("built", len(ARTICLES), "articles")
