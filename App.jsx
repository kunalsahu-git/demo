import { useState, useEffect, useRef, useCallback } from "react";

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'DM Sans',sans-serif;}
@keyframes hsPulse{0%{transform:translate(-50%,-50%) scale(1);opacity:.65;}65%{transform:translate(-50%,-50%) scale(2.8);opacity:0;}100%{transform:translate(-50%,-50%) scale(2.8);opacity:0;}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes fadeUp{from{opacity:0;transform:translateY(7px);}to{opacity:1;transform:translateY(0);}}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes execDot{0%,80%,100%{opacity:.2;}40%{opacity:1;}}
@keyframes notifIn{from{opacity:0;transform:translateX(14px);}to{opacity:1;transform:translateX(0);}}
@keyframes slideUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
@keyframes scaleIn{from{opacity:0;transform:scale(.96);}to{opacity:1;transform:scale(1);}}
@keyframes barFill{from{width:0%;}to{width:var(--w,100%);}}
@keyframes scanLine{0%{top:0%;opacity:.6;}100%{top:100%;opacity:0;}}
@keyframes annotationIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
@keyframes liveDot{0%,100%{opacity:1;}50%{opacity:.3;}}
.sc{animation:fadeIn .22s ease;}
.tt{animation:fadeUp .18s ease;}
.ni{animation:notifIn .32s ease .4s both;}
.su{animation:slideUp .3s ease both;}
.si{animation:scaleIn .25s ease both;}
.scroll::-webkit-scrollbar{width:5px;}
.scroll::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:3px;}
`;



// ── Real Unsplash Image Dictionary mapped by Industry ─────────────────────────
// All IDs are 2018-2022 era — old pre-2018 IDs were returning duplicate/broken images
const IMAGE_DICT = {
  "healthcare & wellness": [
    "1576091160399-112ba8d25d1d", // stethoscope flatlay
    "1584308666744-247e8f68ca39", // doctor with device
    "1559757148-5c7a5aed4b82",    // healthcare professional
    "1532938911079-1b06ac7ceec7", // doctor consultation
    "1551076805-e18690c50f15",    // hospital corridor
    "1581056771107-11a4b09a56e1", // medical team
    "1516549655169-df83a0774514", // lab researcher
    "1603398938240-de1e3a68db5f"  // medicine cabinet
  ],
  "financial services": [
    "1611974789855-9c2a0a7236a3", // trading dashboard
    "1556742049-0cfed4f6a45d",    // finance laptop
    "1579621970163-a41c86bac431", // investment/gold
    "1553729484-70c6a4ab0938",    // mobile fintech
    "1590283603385-17ffb3a7f29f", // contactless payment
    "1565514020179-026b92b2d08b", // financial planning
    "1601597111164-4f336e0160b6", // fintech interface
    "1554224155-6725b3076ce9"     // market data
  ],
  "retail & commerce": [
    "1558618618-8c700b8f4a30",    // fashion store interior
    "1483985988355-763728e1935b", // shopping bags
    "1567401893-0c4c4a85b9b4",    // retail lifestyle
    "1536299192238-f3e5d9e7abd9", // fashion shopping
    "1523381210434-271e8be1f52b", // retail product display
    "1607082348-72f0fcb4d93d",    // fashion editorial
    "1558769132-cb1aea458c5e",    // clothing rack
    "1599309329273-e44da3b9be9c"  // boutique storefront
  ],
  "automotive": [
    "1552519507-da3b142c6e3d",    // luxury car exterior
    "1583123637159-8fa9fbb00d06", // modern SUV
    "1549317661-bd32c8ce0db2",    // car detail shot
    "1533473359331-01d5201cb5c1", // car at night
    "1503376713356-ab0e19a3b5a7", // driving perspective
    "1494976388531-d1058494cdd8", // luxury car road shot
    "1618843986563-5f4f0f3f76e5", // EV charging
    "1597762470488-a47ded63c220"  // showroom interior
  ],
  "education": [
    "1523050854058-8df90110c9f1", // university campus
    "1509062522246-3755977927d7", // students in class
    "1523240409-dae53b3b3c75",    // modern classroom
    "1524178232363-1ecef6156e0d", // online learning
    "1541339155-3b25fa7c30b0",    // student studying
    "1513258496099-481a80fa18c7", // graduation ceremony
    "1588072404-9b54b52dd3cb",    // digital learning
    "1580582855-7e30c07a9d5e"     // research library
  ],
  "travel & hospitality": [
    "1540555640-c8e4dfd5cfb3",    // tropical destination
    "1583244407-4b4b2ac08009",    // luxury resort pool
    "1501785888041-af3ef285b460", // seaside vista
    "1566073771259-6a8506099945", // hotel pool terrace
    "1540541338-8c272ef6d8e2",    // hotel room premium
    "1520260497591-112f2f40a3f4", // airplane window seat
    "1476514525535-07fb3b4ae5f1", // mountain landscape
    "1549639289-c217c27f58e9"     // boutique hotel lobby
  ],
  "food & beverage": [
    "1497935586351-b67a49e012bf", // coffee & espresso flatlay
    "1509042239860-f550ce710b93", // latte art
    "1571091718767-18b5b1457add", // espresso shot
    "1511920170033-f8396924c348", // coffee beans
    "1495474472359-d3b7e5e59b02", // overhead black coffee
    "1578897839-96d8b3a6e903",    // cafe scene
    "1572019523773-fa6a9070f2a2", // hot coffee cup
    "1504630083234-14187a9df0f5"  // warm cafe interior
  ],
  "enterprise technology": [
    "1518770660439-4636190af475", // tech setup/gear
    "1504639725590-34d0984388bd", // code on screen
    "1550751827-4bd374c3f58b",    // data center
    "1551288049-bebda4e38f71",    // AI concept
    "1531297172867-1ea55333fccf", // software dev
    "1504384308090-c894fdcc538d", // tech workspace
    "1460925895917-afdab827c52f", // laptop minimal
    "1573164713988-8665fc963095"  // cloud/server room
  ],
  "sports & fitness": [
    "1571019614242-c5c5dee9f50b", // runner athlete
    "1552674605-db5fecabfe65",    // gym weights
    "1526506118085-60ce8714f8c5", // sports track
    "1517836369-d38317a68931",    // marathon runner
    "1534438327-41d1f4b7a3c5",    // fitness training
    "1576678927-39d88614b562",    // gym interior
    "1565728744382-61accd4c7d68", // gym equipment
    "1549060279-7e168fcee0c2"     // sports action
  ],
  "beauty & cosmetics": [
    "1596462502278-27bfdc9c3a08", // skincare products flatlay
    "1522335789-8b0f9756c58c",    // makeup artist
    "1487412947147-5cebf100ffc2", // beauty products
    "1560472354-b33ff0ad4a99",    // cosmetics closeup
    "1598440947619-2c35fc9aa181", // skincare routine
    "1512496015851-a90fb38ba796", // makeup brushes
    "1571781926291-c77da103c28b", // perfume bottle
    "1556228720-195a672e8a03"     // beauty portrait
  ],
  "luxury & accessories": [
    "1523170335258-f6a30a7a5f63", // luxury watch
    "1547996160-2ab28cc6a5f5",    // watch detail closeup
    "1524592094714-0f0654e359b1", // jewelry flatlay
    "1506630448831-5a1b83c5a67e", // luxury lifestyle
    "1485290334039-a3b97f0b7ef4", // watch on wrist
    "1611591437281-460bfbe1220a", // premium timepiece
    "1492707892479-7bc8d5a4ee93", // accessories editorial
    "1513909120847-11bdf8e3fcab"  // luxury detail
  ],
  "default": [
    "1497366216548-37526070297c", // open office
    "1522071820081-009f0129c71c", // team meeting
    "1551836022-d33370ef43b6",    // modern workspace
    "1515169061895-373a0e5b0260", // business professional
    "1521737604893-d14cc237f11d", // focused work
    "1552664730-d307ca884978",    // creative office
    "1531482615713-2defd0a5192b", // innovation space
    "1507679622140-615266c150fa"  // productivity
  ]
};

// ── Utilities ─────────────────────────────────────────────────────────────────
const ip = (str, p) => {
  if (!str || !p) return str || "";
  return str
    .replace(/\{co\}/g, p.companyName || "Your Company")
    .replace(/\{ca\}/g, p.campaignName || "New Campaign")
    .replace(/\{cd\}/g, p.campaignDescription || "")
    .replace(/\{ind\}/g, p.industry || "technology")
    .replace(/\{who\}/g, p.personaName || "Maya")
    .replace(/\{role\}/g, p.personaTitle || "Head of Digital")
    .replace(/\{trigger\}/g, p.urgentCampaignTrigger || "An urgent business need has accelerated the timeline");
};

const cc = hex => {
  if (!hex || hex.length < 7) return "#fff";
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return .299 * r + .587 * g + .114 * b > 148 ? "#111827" : "#ffffff";
};

const initials = name => name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "?";

// Bypasses CSP blocks on iframes
const getProxyUrl = (url) => {
  if (!url) return "";
  return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
};

// ── Smart Industry Detection ──────────────────────────────────────────────────
const detectIndustry = url => {
  const d = (url || "").toLowerCase();
  if (/(health|hospital|medic|pharma|clinic|care|bio|wellness|therapy)/.test(d)) return {
    industry: "healthcare & wellness", products: ["Patient Experience Platform", "Clinical Data Hub", "Telehealth Suite"],
    campaignName: "Digital Health Innovation Summit", campaignDescription: "Transforming patient care through intelligent digital experiences and connected health technology.",
    urgentCampaignTrigger: "A competing health system just announced their digital transformation, accelerating our timeline",
    assetKeywords: ["medical team technology", "patient care digital", "healthcare innovation", "clinical excellence"],
    contentClusterTitles: ["How Digital Health Platforms Are Reshaping Patient Outcomes in 2026", "5 Ways AI-Powered Clinical Tools Reduce Provider Burnout", "The Complete Guide to HIPAA-Compliant Digital Patient Experiences", "Why Healthcare Leaders Are Investing in Connected Digital Ecosystems"]
  };
  if (/(bank|financ|capital|invest|fund|insur|credit|wealth|asset)/.test(d)) return {
    industry: "financial services", products: ["Digital Banking Platform", "Wealth Management Suite", "Risk Intelligence"],
    campaignName: "NextGen Banking Experience", campaignDescription: "Delivering seamless, secure, and personalized financial services across every digital touchpoint.",
    urgentCampaignTrigger: "A fintech disruptor just launched a competing product targeting our core customer segment",
    assetKeywords: ["digital banking mobile", "financial technology", "investment wealth", "banking security"],
    contentClusterTitles: ["The Future of Digital Banking: What Customers Expect in 2026", "How Open Banking APIs Are Unlocking New Revenue Streams", "Digital Wealth Management: A Guide for Modern Investors", "Why Financial Institutions Are Prioritizing Personalized Digital Experiences"]
  };

  if (/(sport|fitness|gym|athlet|workout|yoga|decathlon|puma|reebok|running|activewear|cricket|football|soccer|tennis)/.test(d)) return {
    industry: "sports & fitness", products: ["Performance Gear", "Training Apparel", "Sport Accessories"],
    campaignName: "Peak Performance Campaign", campaignDescription: "Inspiring athletes at every level with gear engineered for performance and style.",
    urgentCampaignTrigger: "A major sporting event created an immediate window to reach our core audience",
    assetKeywords: ["athlete training action", "sports performance gear", "fitness lifestyle", "active outdoor"],
    contentClusterTitles: ["Training Like a Pro: The Gear That Makes the Difference", "5 Workouts to Elevate Your Performance This Season", "The Science Behind High-Performance Sportswear", "Why Athletes Are Switching to Smarter Training Tools"]
  };
  if (/(beauty|cosmetic|skincare|makeup|nykaa|salon|sephora|loreal|fragrance|perfume|serum|lipstick)/.test(d)) return {
    industry: "beauty & cosmetics", products: ["Skincare Collection", "Makeup Line", "Fragrance Range"],
    campaignName: "Glow Up Campaign", campaignDescription: "Celebrating confidence and self-expression through premium beauty innovations.",
    urgentCampaignTrigger: "A trending beauty moment on social media created an immediate launch opportunity",
    assetKeywords: ["skincare product lifestyle", "makeup editorial beauty", "cosmetics flatlay", "beauty portrait glow"],
    contentClusterTitles: ["Your Ultimate Skincare Routine for Radiant Skin", "The 10 Beauty Trends Dominating 2026", "How to Build a Minimalist Makeup Kit That Works", "Behind the Formula: How We Develop Our Skincare Products"]
  };
  if (/(watch|jewel|accessory|accessories|jeweller|jewellery|fastrack|titan|tanishq|rolex|timepiece|diamond)/.test(d)) return {
    industry: "luxury & accessories", products: ["Watch Collection", "Jewellery Line", "Accessories Range"],
    campaignName: "Iconic Collection Launch", campaignDescription: "Unveiling our most refined collection — crafted for those who wear their story.",
    urgentCampaignTrigger: "A flagship seasonal gifting window opened earlier than expected",
    assetKeywords: ["luxury watch detail", "jewelry editorial", "accessories lifestyle premium", "timepiece closeup"],
    contentClusterTitles: ["The Art of Gifting: Our Most Iconic Pieces for 2026", "Craftsmanship Spotlight: How Our Watches Are Made", "Style Guide: Pairing Accessories for Every Occasion", "The Story Behind Our New Iconic Collection"]
  };
  // Added nike, adidas, shoe, apparel, etc. here so it defaults correctly to Retail
  if (/(retail|shop|store|fashion|apparel|cloth|brand|luxury|beauty|cosmetic|nike|adidas|shoe|wear)/.test(d)) return {
    industry: "retail & commerce", products: ["Digital Storefront", "Loyalty & Rewards", "Brand Experience Hub"],
    campaignName: "Summer Style Collection 2026", campaignDescription: "Launching our boldest seasonal collection with an immersive digital-first shopping experience.",
    urgentCampaignTrigger: "A major competitor announced an early Summer sale, requiring us to launch our campaign 3 weeks ahead",
    assetKeywords: ["fashion lifestyle product", "retail store experience", "clothing collection", "brand aesthetic"],
    contentClusterTitles: ["Summer 2026 Style Trends: What's Hot Right Now", "How to Build a Capsule Wardrobe with Our Summer Collection", "Behind the Design: The Story of Our Summer Collection", "Style Guide: 10 Ways to Wear Our Best-Selling Summer Pieces"]
  };

  if (/(auto|car|vehicl|motor|drive|fleet|truck|ev|electric)/.test(d)) return {
    industry: "automotive", products: ["Vehicle Discovery Platform", "Service & Maintenance Hub", "Fleet Intelligence"],
    campaignName: "Next Generation Launch Event", campaignDescription: "Unveiling our most advanced vehicle lineup with an exclusive digital experience for early adopters.",
    urgentCampaignTrigger: "A competitor's EV announcement shifted market attention, requiring us to launch our campaign immediately",
    assetKeywords: ["luxury vehicle showroom", "automotive technology", "car driving experience", "vehicle design detail"],
    contentClusterTitles: ["Inside the Technology Powering Our Next-Generation Vehicles", "Electric vs. Hybrid: Which Is Right for You in 2026?", "The Complete Buyer's Guide to Our New Vehicle Lineup", "How Our Vehicles Are Engineered for the Future of Driving"]
  };
  if (/(edu|univers|college|school|learn|academ|campus|course|study)/.test(d)) return {
    industry: "education", products: ["Learning Experience Platform", "Student Success Hub", "Research & Innovation Portal"],
    campaignName: "Fall Enrollment 2026", campaignDescription: "Connecting prospective students with their future through personalized digital discovery experiences.",
    urgentCampaignTrigger: "Early application deadlines have moved up, requiring immediate outreach to prospective students",
    assetKeywords: ["campus university life", "student learning digital", "academic research lab", "graduation success"],
    contentClusterTitles: ["Why Our Programs Are Ranked Among the Best in the Nation", "Student Success Stories: How Our Graduates Are Changing the World", "Your Complete Guide to Applying for Fall 2026", "Campus Life: What to Expect in Your First Year"]
  };
  if (/(travel|hotel|hospit|resort|airline|flight|tour|vacation|cruise)/.test(d)) return {
    industry: "travel & hospitality", products: ["Digital Booking Engine", "Guest Experience Platform", "Loyalty Compass"],
    campaignName: "Summer Escapes 2026", campaignDescription: "Inspiring wanderlust with curated summer travel experiences and exclusive member-only pricing.",
    urgentCampaignTrigger: "Summer booking season is peaking 4 weeks early, requiring immediate campaign activation",
    assetKeywords: ["luxury resort beach", "hotel lobby experience", "travel destination scenery", "business travel lounge"],
    contentClusterTitles: ["The 10 Most Breathtaking Summer Destinations for 2026", "Insider Travel Hacks to Maximize Your Summer Getaway", "How Our Loyalty Program Makes Every Journey More Rewarding", "Summer Travel Trends: What's Drawing Travelers in 2026"]
  };
  if (/(food|cafe|coffee|restaurant|dine|burger|drink|beverage|starbucks|mcdonald|subway|chipotle|domino|pizz|sushi|bakery|brew|roast|espresso|latte|boba|juice|grocery|snack)/.test(d)) return {
    industry: "food & beverage", products: ["Mobile Order & Pay", "Customer Rewards", "Digital Menu Hub"],
    campaignName: "Seasonal Flavor Launch", campaignDescription: "An exclusive early-access event for our newest seasonal beverages and treats.",
    urgentCampaignTrigger: "A viral social media trend created sudden demand for our seasonal items",
    assetKeywords: ["artisan coffee drink", "restaurant interior", "fresh food photography", "cafe lifestyle"],
    contentClusterTitles: ["Behind the Beans: How We Source Our Seasonal Blends", "The Ultimate Guide to Pairing Our New Pastries", "Why Digital Ordering is Changing the Cafe Experience", "Meet the Baristas Behind Your Favorite Drinks"]
  };
  return {
    industry: "enterprise technology", products: ["Digital Experience Platform", "AI Analytics Suite", "Content Intelligence Hub"],
    campaignName: "Platform Innovation Summit 2026", campaignDescription: "Showcasing our most powerful platform release — built for speed, scale, and intelligent automation.",
    urgentCampaignTrigger: "A major industry analyst report created an immediate market window we must capture now",
    assetKeywords: ["enterprise software interface", "digital innovation hub", "AI technology platform", "cloud computing"],
    contentClusterTitles: ["How AI-Powered Digital Experiences Are Transforming Customer Engagement", "The Platform Buyer's Guide: What to Look for in 2026", "From Legacy to Modern: A CTO's Guide to Digital Transformation", "Why Leading Enterprises Choose Modern Content Platforms"]
  };
};

const fallbackProspect = url => {
  let domain = (url || "").replace(/https?:\/\//, "").replace(/www\./, "").split("/")[0];
  let co = domain.split(".")[0];
  co = co ? co.charAt(0).toUpperCase() + co.slice(1) : "Company";
  const ind = detectIndustry(url);
  const names = [["Sarah", "Chen"], ["Maya", "Patel"], ["Alex", "Johnson"], ["Jordan", "Williams"], ["Morgan", "Rodriguez"], ["Casey", "Thompson"]];
  const nm = names[Math.floor(Math.random() * names.length)];
  const titleOpts = ["Head of Digital Experience", "VP of Marketing", "Director of Digital Strategy", "Chief Marketing Officer", "Head of Brand & Content"];
  const title = titleOpts[Math.floor(Math.random() * titleOpts.length)];
  return {
    companyName: co, personaName: `${nm[0]} ${nm[1]}`, personaTitle: title,
    primaryColor: "#0076BD", secondaryColor: "#7C3AED", ...ind,
    businessDescription: `${co} is a leading ${ind.industry} organization delivering exceptional experiences across digital and physical channels.`,
    siteDescription: "Clean, professional design with bold brand colors, modern typography, and conversion-focused layouts.",
    url: url || "https://example.com"
  };
};

// ── API Calls (Gemini API) ─────────────────────────────────────────

// Fetches real webpage content via allorigins proxy (fetch calls are NOT blocked by child-src CSP).
// Extracts title, meta description, OG tags, h1, and a snippet of visible body text.
// This gives Gemini actual ground truth about the page instead of guessing from the URL.
async function fetchWebsiteSignals(url) {
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return { signals: null, imageUrls: [] };
    const html = await res.text();
    const baseUrl = new URL(url).origin;

    const get = (pattern) => {
      const m = html.match(pattern);
      return m ? (m[1] || "").replace(/<[^>]+>/g, "").trim() : "";
    };

    const title = get(/<title[^>]*>([^<]{1,200})<\/title>/i);
    const desc = get(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{1,400})["']/i)
      || get(/<meta[^>]+content=["']([^"']{1,400})["'][^>]+name=["']description["']/i);
    const ogTitle = get(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']{1,200})["']/i);
    const ogDesc = get(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']{1,400})["']/i);
    const ogSiteName = get(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']{1,100})["']/i);
    const keywords = get(/<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']{1,300})["']/i);
    const h1 = get(/<h1[^>]*>([^<]{1,200})<\/h1>/i);
    const h2s = [...html.matchAll(/<h2[^>]*>([^<]{1,200})<\/h2>/gi)].slice(0, 4).map(m => m[1].trim()).join(" | ");

    const bodySnippet = (html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 800));

    const signals = [title, ogSiteName, ogTitle, desc, ogDesc, h1, h2s, keywords, bodySnippet]
      .filter(Boolean).join("\n").trim();

    // ── Extract real image URLs from the page ──────────────────────────────
    const imageUrls = new Set();

    // og:image / twitter:image (best quality, usually CDN-hosted)
    [...html.matchAll(/<meta[^>]+(?:og:image|twitter:image)[^>]+content=["']([^"']+)["']/gi)]
      .forEach(m => m[1] && !m[1].startsWith("data:") && imageUrls.add(m[1]));
    [...html.matchAll(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:og:image|twitter:image)/gi)]
      .forEach(m => m[1] && !m[1].startsWith("data:") && imageUrls.add(m[1]));

    // srcset images (high-res)
    [...html.matchAll(/srcset=["']([^"']+)["']/gi)].forEach(m => {
      m[1].split(",").forEach(part => {
        const src = part.trim().split(/\s+/)[0];
        if (src && src.startsWith("http") && /\.(jpg|jpeg|png|webp)/i.test(src)) imageUrls.add(src);
      });
    });

    // Regular <img src>
    [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)].forEach(m => {
      const src = m[1];
      if (!src || src.startsWith("data:") || /icon|logo|sprite|pixel|1x1|tracking|svg/i.test(src)) return;
      const absolute = src.startsWith("http") ? src : src.startsWith("//") ? "https:" + src : baseUrl + (src.startsWith("/") ? src : "/" + src);
      if (/\.(jpg|jpeg|png|webp)/i.test(absolute)) imageUrls.add(absolute);
    });

    const filteredImages = [...imageUrls].slice(0, 8);

    // First og:image is the most reliable single brand image
    const ogImage = (() => {
      const m = html.match(/<meta[^>]+(?:og:image|twitter:image)[^>]+content=["']([^"']+)["']/i)
               || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:og:image|twitter:image)/i);
      return m?.[1] && !m[1].startsWith("data:") ? m[1] : filteredImages[0] || null;
    })();

    return {
      signals: signals || null,
      imageUrls: filteredImages,
      rawMeta: { title, desc, ogTitle, ogDesc, ogSiteName, h1, h2s, keywords, ogImage }
    };
  } catch {
    return { signals: null, imageUrls: [], rawMeta: {} };
  }
}

async function analyzeProspect(url) {
  const endpoint = import.meta.env.VITE_API_ENDPOINT;

  // Fetch Microlink screenshot + HTML signals in parallel.
  // Microlink renders full JS SPAs and returns a CDN URL with CORS headers.
  // Falls back to thum.io which works as an <img src> (no CORS needed for img tags).
  const thumFallback = `https://image.thum.io/get/width/1280/crop/900/noanimate/${encodeURIComponent(url)}`;

  const [mlData, { signals: pageSignals, imageUrls, rawMeta }] = await Promise.all([
    fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=true&images=true`, {
      signal: AbortSignal.timeout(12000)
    })
      .then(r => r.json())
      .then(d => ({
        screenshot: d?.data?.screenshot?.url || null,
        mainImage: d?.data?.image?.url || null,
        images: (d?.data?.images || [])
          .filter(img =>
            img.url &&
            (img.width > 300 || !img.width) &&
            !/(icon|logo|badge|pixel|sprite|tracking|avatar|1x1|button)/i.test(img.url)
          )
          .slice(0, 8)
      }))
      .catch(() => ({ screenshot: null, mainImage: null, images: [] })),
    fetchWebsiteSignals(url)
  ]);

  const screenshotUrl = mlData.screenshot || thumFallback;

  const supplemental = pageSignals
    ? `\n\nHTML metadata from page source:\n${pageSignals}`
    : "";

  const prompt = `Analyze this company website: ${url}${supplemental}

Return ONLY this JSON (no markdown, no backticks):
{
  "companyName": "company name from the nav/logo",
  "personaName": "realistic full name for a marketing leader here",
  "personaTitle": "realistic title e.g. VP Marketing, Head of Digital",
  "primaryColor": "#hex dominant brand color",
  "secondaryColor": "#hex secondary/accent color",
  "industry": "2-4 word description of what they do",
  "products": ["3 actual products or services"],
  "campaignName": "name of a timely campaign they would run now",
  "campaignDescription": "one sentence describing the campaign",
  "urgentCampaignTrigger": "realistic reason this campaign was accelerated",
  "assetKeywords": ["4 specific visual photo keywords e.g. 'athlete sprinting', 'running shoe closeup'"],
  "contentClusterTitles": ["SEO title 1","SEO title 2","SEO title 3","SEO title 4"],
  "businessDescription": "one sentence on what this company does",
  "siteDescription": "describe visual design: dark/light, typography, imagery style",
  "heroHeadline": "main headline text on the homepage",
  "navLinks": ["nav link labels from the header"],
  "heroSubtext": "subheadline beneath the main headline"
}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      "x-api-key": import.meta.env.VITE_API_KEY
    },
    body: JSON.stringify({
      model: import.meta.env.VITE_MODEL,
      max_tokens: 1500,
      system: "You analyze company websites and return ONLY a valid JSON object. No markdown. No backticks. Just the raw JSON.",
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data.error || data));
  const text = data.content?.[0]?.text || "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON from model");

  const ogImage = rawMeta?.ogImage || null;
  const allImages = ogImage ? [ogImage, ...imageUrls.filter(u => u !== ogImage)] : imageUrls;

  return {
    ...JSON.parse(match[0]),
    url,
    screenshotUrl,
    // true = Microlink rendered a real page; false = thumFallback (often shows error/block pages)
    screenshotFromMicrolink: !!mlData.screenshot,
    imageUrls: allImages,
    mlMainImage: mlData.mainImage,
    mlPageImages: mlData.images,
    rawMeta: rawMeta || {}
  };
}

function injectClusterSection(html, p) {
  const titles = (p.contentClusterTitles || []).slice(0, 4);
  if (!titles.length) return html;
  const pc = p.primaryColor || "#0076BD";
  let isDark = false;
  try { const r=parseInt(pc.slice(1,3),16),g=parseInt(pc.slice(3,5),16),b=parseInt(pc.slice(5,7),16); isDark=.299*r+.587*g+.114*b<60; } catch {}
  const bg = isDark ? "#111" : "#f8fafc";
  const cardBg = isDark ? "#1a1a1a" : "#ffffff";
  const border = isDark ? "#2a2a2a" : "#e5e7eb";
  const txt = isDark ? "#ffffff" : "#111827";
  const sub = isDark ? "#888888" : "#6b7280";
  const types = ["Article","Guide","Report","Deep Dive"];
  const mins  = ["4 min read","6 min read","5 min read","7 min read"];
  const section = `
<section style="background:${bg};padding:72px 48px;">
  <div style="max-width:1100px;margin:0 auto;">
    <div style="font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:${pc};margin-bottom:10px;">From the Content Studio</div>
    <h2 style="font-size:30px;font-weight:800;color:${txt};margin-bottom:32px;letter-spacing:-.01em;">AEO-Ready Articles</h2>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;">
      ${titles.map((t,i)=>`<div style="background:${cardBg};border:1px solid ${border};border-top:3px solid ${pc};border-radius:10px;padding:22px;">
        <div style="font-size:10px;font-weight:700;color:${pc};letter-spacing:.12em;text-transform:uppercase;margin-bottom:10px;">${types[i]}</div>
        <div style="font-size:14px;font-weight:700;color:${txt};line-height:1.5;margin-bottom:12px;">${t}</div>
        <div style="font-size:11px;color:${sub};margin-bottom:14px;">${mins[i]}</div>
        <a href="#" style="font-size:13px;font-weight:700;color:${pc};text-decoration:none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">Read Article &rarr;</a>
      </div>`).join('')}
    </div>
  </div>
</section>`;
  return html.replace(/<\/body>/i, section + '</body>');
}

async function genCampaignHTML(p, resolvedImages, cardImages) {
  const endpoint = import.meta.env.VITE_API_ENDPOINT;

  // cardImages are pre-fetched by handleStart (shared with DAM) — avoids a second Unsplash API
  // call and ensures DAM and campaign page show consistent, relevant images.
  const kwImgs = cardImages?.length >= 4 ? cardImages
    : await fetchKeywordImages(p.assetKeywords, p.industry, 8).catch(() => buildKeywordImages(p));
  const ogImage = p.rawMeta?.ogImage;

  // Hero: prefer og:image (designed for embedding), fall back to Unsplash keyword image.
  // Intentionally skip p.screenshotUrl — a full-page Microlink screenshot looks terrible
  // as a hero background (wrong dimensions, contains full page chrome, hotlink issues).
  // Cards/bg: always use curated Unsplash — scraped site images fail inside iframe srcDoc
  // due to CDN referer checks that block cross-origin iframe contexts.
  const heroUrl  = ogImage || kwImgs[0]
    || `https://picsum.photos/seed/${encodeURIComponent(p.companyName||'co')}0/1400/900`;
  const card1Url = kwImgs[0];
  const card2Url = kwImgs[1];
  const card3Url = kwImgs[2];
  // bgUrl: Unsplash images are reliable inside iframe — og:image might have hotlink issues
  const bgUrl    = kwImgs[3] || kwImgs[0];

  const isDarkBrand = (() => {
    try {
      const pc = p.primaryColor || "#fff";
      const r = parseInt(pc.slice(1,3),16), g = parseInt(pc.slice(3,5),16), b = parseInt(pc.slice(5,7),16);
      return .299*r+.587*g+.114*b < 60;
    } catch { return false; }
  })();

  const pc = p.primaryColor || "#0076BD";
  const sc = p.secondaryColor || "#7C3AED";
  const co = p.companyName || "Company";
  const ca = p.campaignName || "Campaign";
  const navLinks = (p.navLinks || ["Home","Products","About","Contact"]).join(", ");

  const clusterTitles = (p.contentClusterTitles || []).slice(0, 4);
  const readTimes = ["4 min read", "6 min read", "5 min read", "7 min read"];

  const sysPrompt = "You are an expert web designer. Create a complete, self-contained campaign landing page HTML file. Return ONLY valid HTML starting with <!DOCTYPE html>. No markdown fences, no explanation.";

  const userPrompt = `Build a high-fidelity campaign landing page for ${co}'s "${ca}" campaign.

BRAND TOKENS:
- Primary: ${pc}${isDarkBrand ? " — DARK BRAND: use #000/#111 backgrounds, white text, UPPERCASE headlines" : ""}
- Secondary: ${sc}
- Font: system-ui, -apple-system, sans-serif
- Industry: ${p.industry}
- Campaign: ${p.campaignDescription}
- Products: ${p.products?.join(", ")}

BRAND IMAGERY — these are real photos extracted from ${co}'s own website. Use them to make the page feel authentically on-brand (like a real ${co} page, not a generic template).
Copy these strings EXACTLY into your HTML — do not shorten, rename, or substitute them:
• Hero background  → "${heroUrl}"   ← the brand's primary visual — make the hero feel alive
• Card 1 image     → "${card1Url}"
• Card 2 image     → "${card2Url}"
• Card 3 image     → "${card3Url}"
• Section bg       → "${bgUrl}"

NAV LINKS: ${navLinks}

CONTENT CLUSTER ARTICLES (from Writing Assistant — use these exact titles):
${clusterTitles.map((t, i) => `Article ${i + 1}: "${t}" — ${readTimes[i]}`).join("\n")}

REQUIRED SECTIONS (in order):
1. <nav> sticky, ${isDarkBrand ? "background:#111" : `background:${pc}`}, ${co} logo (bold, white), nav links, CTA button
2. <section id="hero"> height:100vh, background-image:url("${heroUrl}") center/cover no-repeat, overlay rgba(0,0,0,${isDarkBrand ? "0.65" : "0.62"}), centered white text: huge headline (${isDarkBrand ? "font-weight:900;text-transform:uppercase;font-size:clamp(48px,8vw,96px)" : "font-weight:800;font-size:clamp(40px,6vw,72px)"}), subtext, two CTA buttons
3. <section id="products"> ${isDarkBrand ? "background:#000" : "background:#f9fafb"}, 3 cards side by side in a CSS grid (grid-template-columns:repeat(3,1fr)). Card 1: <img src="${card1Url}" style="display:block;width:100%;height:220px;object-fit:cover">, then product name + description. Card 2: <img src="${card2Url}" style="display:block;width:100%;height:220px;object-fit:cover">, then product name + description. Card 3: <img src="${card3Url}" style="display:block;width:100%;height:220px;object-fit:cover">, then product name + description. ALL 3 cards must be present and use the exact URLs above.
4. <section id="showcase"> full-width, background-image:url("${bgUrl}") center/cover, overlay rgba(0,0,0,0.65), bold centered white text, stat numbers
5. <section id="insights"> ${isDarkBrand ? "background:#111;color:#fff" : "background:#f9fafb"}, heading "From the Content Studio" (left-aligned, bold), 4-column article card grid. Each card: top accent bar (4px, ${pc}), article title from the content cluster above (font-weight:600, font-size:15px), read-time badge (small pill, ${isDarkBrand ? "background:#222;color:#aaa" : "background:#e5e7eb;color:#6b7280"}), "Read Article" text-link (href="#", color:${pc}, font-weight:600, no underline by default, underline on hover). Cards: ${isDarkBrand ? "background:#1a1a1a;border:1px solid #333" : "background:#fff;border:1px solid #e5e7eb"}, border-radius:10px, padding:20px. No images in this section.
6. <section id="register"> ${isDarkBrand ? "background:#111" : `background:${pc}`}, email input + submit button, centered layout
7. <footer> dark background, ${co} name, nav links, copyright

CSS RULES:
${isDarkBrand ? `- All section backgrounds: #000 or #111 (never white or light)
- All text: #fff
- Headlines: text-transform:uppercase; letter-spacing:0.05em; font-weight:900
- Buttons: background:#fff; color:#000; border-radius:2px; padding:14px 32px; font-weight:700; text-transform:uppercase
- Cards: background:#111; border:1px solid #222; border-radius:0` : `- Primary color ${pc} used for nav, buttons, accents
- Cards: background:#fff; border-radius:12px; box-shadow:0 2px 12px rgba(0,0,0,0.08)
- Buttons: background:${pc}; color:#fff; border-radius:8px; padding:14px 32px; font-weight:700`}
- img tags: always include style="display:block;width:100%;object-fit:cover"
- * { box-sizing:border-box; margin:0; padding:0 }
- body { font-family:system-ui,-apple-system,sans-serif }

Output a single complete HTML file. All CSS in a <style> tag in <head>. No external CSS files.`;


  let htmlResult = null;

  for (let attempt = 0; attempt < 2 && !htmlResult; attempt++) {
    if (attempt > 0) await new Promise(r => setTimeout(r, 4000));
    try {
      const anthropicRes = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
          "x-api-key": import.meta.env.VITE_API_KEY
        },
        body: JSON.stringify({
          model: import.meta.env.VITE_MODEL,
          max_tokens: 8000,
          system: sysPrompt,
          messages: [{ role: "user", content: userPrompt }]
        })
      });
      if (anthropicRes.ok) {
        const data = await anthropicRes.json();
        const text = data.content?.[0]?.text || "";
        const match = text.match(/<!DOCTYPE html>[\s\S]*/i);
        htmlResult = match ? match[0] : text;
      } else {
        console.warn("HTML gen attempt", attempt + 1, "status:", anthropicRes.status);
      }
    } catch (e) {
      console.warn("HTML gen attempt", attempt + 1, "failed:", e.message);
    }
  }

  return htmlResult;
}

// ── Brand-Faithful Site Mockup ────────────────────────────────────────────────
// Renders a pixel-faithful replica of the prospect's homepage using their real
// brand data: colors, nav links, hero headline, subtext, and extracted images.
function BrandedMockup({ p }) {
  const pc = p.primaryColor || "#111";
  const sc = p.secondaryColor || "#fff";
  const textOnPrimary = cc(pc);
  const navLinks = p.navLinks || ["Products", "Solutions", "Resources", "About"];
  const heroImg = p.rawMeta?.ogImage || (p.imageUrls || [])[0] || p.screenshotUrl;
  const heroHeadline = p.heroHeadline || p.rawMeta?.h1 || `The Future of ${p.industry}.`;
  const heroSubtext = p.heroSubtext || p.rawMeta?.desc || p.businessDescription || "";

  // Detect if this is a dark-background brand (Nike, Apple, etc.)
  const isDark = pc === "#000000" || pc === "#111111" || pc === "#111" || pc === "#000" ||
    (() => { try { const r = parseInt(pc.slice(1,3),16), g = parseInt(pc.slice(3,5),16), b = parseInt(pc.slice(5,7),16); return .299*r+.587*g+.114*b < 60; } catch { return false; } })();

  const heroBg = heroImg
    ? `url(${heroImg}) center/cover no-repeat`
    : isDark
      ? `linear-gradient(135deg, #111 0%, #222 100%)`
      : `linear-gradient(135deg, ${pc} 0%, ${sc} 100%)`;

  const navBg = isDark ? "#111" : pc;
  const navText = isDark ? "#fff" : textOnPrimary;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: isDark ? "#111" : "#fff", overflow: "hidden", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Real Nav */}
      <div style={{ background: navBg, padding: "0 48px", display: "flex", alignItems: "center", height: 64, gap: 40, flexShrink: 0, borderBottom: isDark ? "1px solid #222" : "none" }}>
        <span style={{ color: navText, fontWeight: 900, fontSize: 22, letterSpacing: isDark ? "0.05em" : "-0.5px", textTransform: isDark ? "uppercase" : "none" }}>{p.companyName}</span>
        <div style={{ display: "flex", gap: 28, flex: 1 }}>
          {navLinks.slice(0, 6).map((link, i) => (
            <span key={i} style={{ color: navText, fontSize: 13, fontWeight: 500, opacity: 0.85, cursor: "pointer", whiteSpace: "nowrap" }}>{link}</span>
          ))}
        </div>
        <button style={{ background: isDark ? "#fff" : navText, color: isDark ? "#111" : pc, border: "none", borderRadius: isDark ? 2 : 6, padding: "10px 22px", fontWeight: 700, fontSize: 13, cursor: "pointer", letterSpacing: isDark ? "0.05em" : 0 }}>
          {isDark ? "SHOP NOW" : "Get Started"}
        </button>
      </div>

      {/* Hero */}
      <div style={{ flex: heroImg ? "0 0 480px" : "0 0 420px", background: heroBg, position: "relative", display: "flex", alignItems: isDark ? "flex-end" : "center", padding: isDark ? "0 64px 56px" : "0 64px", overflow: "hidden", flexShrink: 0 }}>
        {/* Dark overlay for readability */}
        <div style={{ position: "absolute", inset: 0, background: isDark
          ? "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%)"
          : heroImg ? "linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 100%)" : "none"
        }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 700 }}>
          {isDark && <div style={{ fontSize: 11, color: sc || "#f5a623", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>{p.campaignName}</div>}
          <div style={{ color: "#fff", fontWeight: 900, fontSize: isDark ? 68 : 52, lineHeight: 1.05, marginBottom: 18, letterSpacing: isDark ? "-0.02em" : "-0.01em", textTransform: isDark ? "uppercase" : "none" }}>
            {heroHeadline}
          </div>
          {heroSubtext && !isDark && (
            <div style={{ color: "rgba(255,255,255,0.88)", fontSize: 17, lineHeight: 1.65, marginBottom: 32, maxWidth: 540 }}>{heroSubtext}</div>
          )}
          <div style={{ display: "flex", gap: 14 }}>
            <button style={{ background: isDark ? "#fff" : pc, color: isDark ? "#111" : textOnPrimary, border: "none", borderRadius: isDark ? 2 : 8, padding: isDark ? "14px 32px" : "15px 32px", fontWeight: 700, fontSize: 14, cursor: "pointer", letterSpacing: isDark ? "0.08em" : 0, textTransform: isDark ? "uppercase" : "none" }}>
              {isDark ? "SHOP NOW" : "Get Started"}
            </button>
            {!isDark && (
              <button style={{ background: "transparent", color: "#fff", border: "2px solid rgba(255,255,255,0.7)", borderRadius: 8, padding: "13px 32px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Learn More</button>
            )}
          </div>
        </div>
      </div>

      {/* Product strip / features */}
      <div style={{ flex: 1, background: isDark ? "#000" : "#f9fafb", padding: "40px 48px", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {(p.products || ["Product 1","Product 2","Product 3"]).slice(0, 3).map((prod, i) => {
            // Never use scraped imageUrls here — they contain marketing text baked in.
            // Always show the clean branded gradient placeholder with product initial.
            const cardImg = null;
            return (
              <div key={i} style={{ background: isDark ? "#111" : "#fff", borderRadius: isDark ? 4 : 12, overflow: "hidden", border: isDark ? "1px solid #222" : "1px solid #e5e7eb" }}>
                {cardImg ? (
                  <div style={{ height: 140, background: `url(${cardImg}) center/cover`, flexShrink: 0 }} />
                ) : (
                  <div style={{ height: 120, background: isDark ? `linear-gradient(135deg,#222,#333)` : `linear-gradient(135deg,${pc}22,${sc}22)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: isDark ? "rgba(255,255,255,0.25)" : `${pc}55`, letterSpacing: "-0.02em" }}>{(prod || "?")[0]}</span>
                  </div>
                )}
                <div style={{ padding: "16px 18px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: isDark ? "#fff" : "#111", marginBottom: 6, textTransform: isDark ? "uppercase" : "none", letterSpacing: isDark ? "0.05em" : 0 }}>{prod}</div>
                  <div style={{ fontSize: 12, color: isDark ? "#999" : "#6b7280", lineHeight: 1.5 }}>Explore {p.companyName}'s latest {p.industry} collection.</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function buildKeywordImages(p) {
  const ind = (p.industry || "default").toLowerCase();
  // food & beverage MUST come before retail — "Global Coffee Retail" contains "retail"
  // but the dominant industry signal is "coffee", so check food-specific terms first
  const ALIASES = {
    "food & beverage":       ["food","cafe","coffee","restaurant","beverage","drink","starbucks","barista","brew","roast","espresso","latte","dine","dining","grocery","snack","bakery","boba","juice","tea"],
    "healthcare & wellness": ["health","medical","pharma","clinic","wellness","hospital"],
    "financial services":    ["financ","bank","invest","insurance","fintech","wealth"],
    "automotive":            ["auto","car","vehicle","motor","drive","fleet","electric"],
    "education":             ["edu","university","college","school","learn","academ"],
    "travel & hospitality":  ["travel","hotel","hospit","resort","airline","tourism"],
    "sports & fitness":      ["sport","fitness","gym","athlet","workout","yoga","running","activewear","cricket","football","soccer","tennis","badminton","cycling","swim","puma","reebok","decathlon"],
    "beauty & cosmetics":    ["beauty","cosmetic","skincare","makeup","skin care","nykaa","salon","sephora","loreal","serum","lipstick","mascara","fragrance","perfume"],
    "luxury & accessories":  ["watch","jewel","accessory","accessories","jeweller","jewellery","fastrack","titan","tanishq","rolex","timepiece","diamond","gemstone","luxury brand"],
    "retail & commerce":     ["retail","shop","commerce","ecommerce","e-commerce","fashion","apparel","store","brand","product"],
    "enterprise technology": ["tech","software","platform","saas","digital","enterprise","cloud","ai","data"],
  };
  const key = Object.keys(ALIASES).find(k => ALIASES[k].some(a => ind.includes(a))) || "default";
  const ids = IMAGE_DICT[key] || IMAGE_DICT["default"];
  return ids.map(id => `https://images.unsplash.com/photo-${id}?w=600&h=420&fit=crop&auto=format`);
}

// ── Dynamic image probe: tests each URL by loading a real <img>, keeps only those that load ──
function probeImages(urls, maxGood = 5, timeoutMs = 5000) {
  return new Promise(resolve => {
    const uniq = [...new Set(urls.filter(Boolean))];
    if (!uniq.length) { resolve([]); return; }
    const good = [];
    let settled = 0;
    const finish = () => { if (++settled === uniq.length) resolve(good.slice(0, maxGood)); };
    uniq.forEach(url => {
      if (good.length >= maxGood) { finish(); return; }
      const img = new window.Image();
      const t = setTimeout(() => { img.src = ""; finish(); }, timeoutMs);
      img.onload = () => {
        clearTimeout(t);
        if (img.naturalWidth > 100 && img.naturalHeight > 80) good.push(url);
        finish();
      };
      img.onerror = () => { clearTimeout(t); finish(); };
      // crossOrigin=anonymous lets naturalWidth/Height work for cross-origin images
      img.crossOrigin = "anonymous";
      img.src = url;
    });
  });
}

// ── Fetch keyword-based images: Unsplash API → source.unsplash.com → hardcoded fallback ──
async function fetchKeywordImages(assetKeywords, industry, count = 8) {
  const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

  if (accessKey) {
    // Try assetKeywords[0] first (most specific), then industry as fallback query.
    // assetKeywords[0] can be too brand/geo-specific (e.g. "Indian athlete sprinting on track")
    // and return < 4 results — industry name (e.g. "Athletic Footwear") is a reliable backup.
    const queries = [assetKeywords?.[0], industry]
      .filter(Boolean)
      .map(q => q.replace(/['"]/g, "").trim());

    for (const query of queries) {
      try {
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
          { headers: { Authorization: `Client-ID ${accessKey}` }, signal: AbortSignal.timeout(8000) }
        );
        const data = await res.json();
        if (data.results?.length >= 4) {
          return data.results.map(r => r.urls.regular);
        }
      } catch { /* try next query */ }
    }
  }

  // Fallback: curated hardcoded IDs by industry — guaranteed unique, always loads.
  // source.unsplash.com is intentionally omitted (deprecated, returns duplicate/wrong images).
  return buildKeywordImages({ industry }).slice(0, count);
}

// ── Main image pipeline: site images first, keyword Unsplash fallback ──
async function buildDynamicImages(p) {
  const pool = [];

  // Tier 1 — OG/Twitter card image: designed for cross-domain embedding, always reliable
  if (p.rawMeta?.ogImage) pool.push(p.rawMeta.ogImage);

  // Tier 2 — Microlink main image (their extraction of the primary page image)
  if (p.mlMainImage && p.mlMainImage !== p.rawMeta?.ogImage) pool.push(p.mlMainImage);

  // Tier 3 — Microlink page images (filtered by size already in analyzeProspect)
  (p.mlPageImages || []).forEach(img => {
    const u = img.url || img;
    if (u && !pool.includes(u)) pool.push(u);
  });

  // Tier 4 — HTML-scraped image URLs (may have hotlink protection — probing handles this)
  (p.imageUrls || []).forEach(u => {
    if (u && !pool.includes(u)) pool.push(u);
  });

  // Probe which of the site images actually load in this browser context
  const working = await probeImages(pool, 5);

  // Fill remaining slots with keyword-based Unsplash (relevant to the actual brand)
  const needed = Math.max(0, 8 - working.length);
  if (needed > 0) {
    const kwImgs = await fetchKeywordImages(p.assetKeywords || [], p.industry || "default", needed);
    working.push(...kwImgs);
  }

  return working.slice(0, 8);
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ aiOpen, active, dam, p }) {
  const pc = p?.primaryColor || "#0076BD";
  const co = p?.companyName || "Acquia";
  const item = (id, icon, label, sub) => {
    const isActive = active === id;
    return (
      <div key={id} style={{
        padding: sub ? "5px 12px 5px 28px" : "5px 12px", cursor: "pointer",
        background: isActive ? "#EFF6FF" : "transparent",
        borderLeft: isActive ? "3px solid #2563EB" : sub ? "2px solid #e5e7eb" : "3px solid transparent",
        color: isActive ? "#1d4ed8" : "#374151", fontWeight: isActive ? 600 : 400, fontSize: 13,
        display: "flex", alignItems: "center", gap: 6, borderRadius: "0 4px 4px 0"
      }}>
        <span style={{ fontSize: 12 }}>{icon}</span>{label}
      </div>
    );
  };
  return (
    <div style={{ width: 192, background: "#fff", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", height: "100%", flexShrink: 0 }}>
      <div style={{ padding: "14px 12px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: "linear-gradient(135deg,#0BB5D6,#0076BD)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 800 }}>⚡</div>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>Acquia Source</span>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "8px 0" }} className="scroll">
        {item("home", "⊞", "Home")}
        <div style={{ padding: "5px 12px", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", color: "#374151", fontSize: 13 }}>
          <span style={{ fontSize: 12 }}>⚡</span><span style={{ flex: 1 }}>AI</span><span style={{ fontSize: 10 }}>▾</span>
        </div>
        {aiOpen && <>
          {item("new-chat", "", "New Chat", true)}
          {item("conversations", "", "Conversations", true)}
          {item("acquia-agents", "", "Acquia Agents", true)}
          {item("resources", "", "Resources", true)}
          {item("settings", "", "Settings", true)}
        </>}
        {item("sites", "🌐", "Sites")}
        {dam && <>
          {item("home2", "⬡", "Apps")}
          <div style={{ padding: "5px 12px", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", color: active === "assets" ? "#1d4ed8" : "#374151", fontSize: 13, background: active === "assets" ? "#EFF6FF" : "transparent", borderLeft: active === "assets" ? "3px solid #2563EB" : "3px solid transparent", fontWeight: active === "assets" ? 600 : 400 }}>
            <span style={{ fontSize: 12 }}>◫</span><span style={{ flex: 1 }}>Assets</span><span style={{ fontSize: 10 }}>▾</span>
          </div>
          {item("assets-sub", "", "Assets", true)}
          {item("insights", "", "Insights", true)}
          {item("dam-details", "", "Acquia DAM Details", true)}
          {item("web-gov", "", "Web governance")}
          <div style={{ padding: "5px 12px", color: "#374151", fontSize: 13, cursor: "pointer" }}>••• More</div>
          {item("content-perf", "", "Content Performance", true)}
          {item("security", "", "Security & Delivery", true)}
          {item("campaigns", "", "Campaigns", true)}
        </>}
      </div>
      <div style={{ padding: "10px 12px", borderTop: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ width: 18, height: 18, borderRadius: 3, background: pc, flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{co}</span>
        </div>
        <div style={{ fontSize: 11, color: "#9ca3af", cursor: "pointer" }}>← Collapse</div>
      </div>
    </div>
  );
}

function TopBar({ crumbs }) {
  return (
    <div style={{ height: 40, borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", padding: "0 16px", gap: 8, fontSize: 13, color: "#6b7280", background: "#fff", flexShrink: 0 }}>
      {crumbs.map((c, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {i > 0 && <span style={{ color: "#d1d5db" }}>|</span>}
          <span style={{ color: i < crumbs.length - 1 ? "#2563EB" : "#374151" }}>{c}</span>
        </span>
      ))}
      <span style={{ marginLeft: 8, color: "#6b7280", display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
        <span style={{ fontSize: 12 }}>📁</span> Crest <span style={{ fontSize: 10 }}>▾</span>
      </span>
    </div>
  );
}

function ChatHeader({ onClose }) {
  return (
    <div style={{ padding: "10px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 10, background: "#fff" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#C084FC,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>JA</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Chat with Jacob</div>
        <div style={{ fontSize: 11, color: "#6b7280", display: "flex", gap: 8 }}><span>📁 Jacob</span><span>Website Builder</span></div>
      </div>
      <span style={{ fontSize: 12, color: "#6b7280", cursor: "pointer" }}>⋯</span>
      <button style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", color: "#374151" }} onClick={onClose}>✕ Close</button>
    </div>
  );
}

function AgentMsg({ text, thinking, p }) {
  const [thinkOpen, setThinkOpen] = useState(false);
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#C084FC,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>JA</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: "#7C3AED", fontWeight: 600, marginBottom: 4 }}>Jacob • Website Builder <span style={{ color: "#9ca3af", fontWeight: 400 }}>just now</span></div>
        {thinking && (
          <div style={{ background: "#FDF2F8", border: "1px solid #F5D0FE", borderRadius: 8, padding: "8px 12px", marginBottom: 8, fontSize: 12, color: "#6b7280" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontWeight: 600, color: "#7C3AED" }} onClick={() => setThinkOpen(o => !o)}>
              <span>{thinkOpen ? "▼" : "▶"}</span> Thinking…
            </div>
            {thinkOpen && <div style={{ marginTop: 6, color: "#374151" }}>{ip(thinking, p)}</div>}
          </div>
        )}
        <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, borderTopLeftRadius: 2, padding: "10px 14px", fontSize: 13, color: "#111827", lineHeight: 1.6 }}>{ip(text, p)}</div>
        <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 16 }}>
          <span style={{ cursor: "pointer" }}>⊡</span><span style={{ cursor: "pointer" }}>👍</span><span style={{ cursor: "pointer" }}>👎</span><span style={{ cursor: "pointer" }}>↺</span>
        </div>
      </div>
    </div>
  );
}

function UserMsg({ text, p }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
      <div style={{ background: "#f3f4f6", borderRadius: 12, borderBottomRightRadius: 2, padding: "10px 14px", fontSize: 13, color: "#111827", maxWidth: "68%", lineHeight: 1.6 }}>{ip(text, p)}</div>
    </div>
  );
}

function ExecMsg({ step, total, pct, text, p }) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#C084FC,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>JA</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ display: "flex", gap: 4 }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#7C3AED", animation: `execDot 1.2s ease ${i * 0.2}s infinite` }} />
            ))}
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Executing</span>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
        </div>
        <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#374151", lineHeight: 1.6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <strong>Step {step}/{total}: </strong>
            <span style={{ color: "#10B981", fontWeight: 600 }}>{pct}%</span>
          </div>
          <div style={{ marginBottom: 8 }}>{ip(text, p)}</div>
          <div style={{ height: 4, background: "#e5e7eb", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "linear-gradient(90deg,#2563EB,#7C3AED)", borderRadius: 2, width: `${pct}%`, animation: `barFill .8s ease both`, ["--w"]: `${pct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatInput({ value, placeholder, p }) {
  const hasVal = (value || "").trim().length > 0;
  return (
    <div style={{ padding: "12px 16px", borderTop: "1px solid #e5e7eb", background: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 24, padding: "8px 14px", gap: 8 }}>
        <span style={{ flex: 1, fontSize: 13, color: hasVal ? "#111827" : "#9ca3af" }}>{ip(value || placeholder || "Message Jacob…", p)}</span>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: hasVal ? "#2563EB" : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", color: hasVal ? "#fff" : "#9ca3af", flexShrink: 0, cursor: "pointer" }}>➤</div>
      </div>
      <div style={{ textAlign: "center", fontSize: 10, color: "#9ca3af", marginTop: 6 }}>Acquia AI can make mistakes.</div>
    </div>
  );
}

function SkillBadge({ label }) {
  return <span style={{ background: "#EFF6FF", color: "#2563EB", border: "1px solid #DBEAFE", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 500, marginRight: 6 }}>{label}</span>;
}

function PlanStep({ n, title, desc, p }) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#2563EB", color: "#fff", fontWeight: 700, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n}</div>
      <div>
        <strong style={{ fontSize: 13, color: "#111827" }}>{ip(title, p)}</strong>
        <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5, marginTop: 2 }}>{ip(desc, p)}</div>
      </div>
    </div>
  );
}

// ── Hotspot + Tooltip ─────────────────────────────────────────────────────────
function Hotspot({ x, y, onClick }) {
  return (
    <div onClick={onClick} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", pointerEvents: "auto", cursor: "pointer", zIndex: 90 }}>
      {[0, 1].map(i => (
        <div key={i} style={{ position: "absolute", top: "50%", left: "50%", width: 28, height: 28, borderRadius: "50%", background: "#2563EB", opacity: .3, animation: `hsPulse 2s ease ${i * 0.6}s infinite` }} />
      ))}
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#2563EB", border: "3px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, boxShadow: "0 2px 8px rgba(37,99,235,.4)", position: "relative", zIndex: 2 }}>+</div>
    </div>
  );
}

function Tooltip({ hs, p, onNext, onBack, num, total }) {
  const x = hs.x, y = hs.y;
  const goLeft = x > 55;
  const goUp = y > 60;
  const goCenter = x >= 35 && x <= 65 && y <= 30;

  let posStyle = {};
  if (goCenter) posStyle = { left: "50%", transform: "translateX(-50%)", top: `calc(${y}% + 28px)` };
  else if (goLeft && goUp) posStyle = { right: `calc(${100 - x}% + 20px)`, bottom: `calc(${100 - y}% + 20px)` };
  else if (goLeft && !goUp) posStyle = { right: `calc(${100 - x}% + 20px)`, top: `calc(${y}% + 10px)` };
  else if (!goLeft && goUp) posStyle = { left: `calc(${x}% + 20px)`, bottom: `calc(${100 - y}% + 20px)` };
  else posStyle = { left: `calc(${x}% + 20px)`, top: `calc(${y}% + 10px)` };

  return (
    <div className="tt" style={{ position: "absolute", ...posStyle, width: 310, background: "#fff", borderRadius: 12, boxShadow: "0 12px 40px rgba(0,0,0,.18)", pointerEvents: "auto", zIndex: 95, overflow: "hidden" }}>
      <div style={{ height: 3, background: "linear-gradient(90deg,#2563EB,#7C3AED)" }} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: .5, marginBottom: 6 }}>Step {num} of {total}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 7 }}>{ip(hs.title, p)}</div>
        <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.65, marginBottom: 14 }}>{ip(hs.body, p)}</div>
        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{ height: 4, borderRadius: 2, background: i < num ? "#2563EB" : "#e5e7eb", width: i === num - 1 ? 18 : i < num ? 8 : 6, transition: "all .25s" }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onBack} disabled={num === 1} style={{ flex: 1, background: num === 1 ? "#f3f4f6" : "#fff", color: num === 1 ? "#d1d5db" : "#374151", border: `1px solid ${num === 1 ? "#e5e7eb" : "#d1d5db"}`, borderRadius: 6, padding: "7px 0", fontSize: 12, fontWeight: 600, cursor: num === 1 ? "default" : "pointer", transition: "all .15s" }}>← Back</button>
          <button onClick={onNext} style={{ flex: 2, background: "linear-gradient(90deg,#2563EB,#7C3AED)", color: "#fff", border: "none", borderRadius: 6, padding: "7px 0", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{hs.isLast ? "🎉 Finish" : "Next →"}</button>
        </div>
      </div>
    </div>
  );
}



function HotspotOverlay({ hs, p, onNext, onBack, cur, total }) {
  const [ttOpen, setTtOpen] = useState(true);
  useEffect(() => { setTtOpen(true); }, [cur]);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 80 }}>
      {!ttOpen && <Hotspot x={hs.x} y={hs.y} onClick={() => setTtOpen(true)} />}
      {ttOpen && <Tooltip hs={hs} p={p} onNext={onNext} onBack={onBack} num={cur + 1} total={total} />}
    </div>
  );
}

// ── BrandBar ──────────────────────────────────────────────────────────────────
function BrandBar({ p, cur, total, step }) {
  const pc = p?.primaryColor || "#0076BD";
  const sc = p?.secondaryColor || "#7C3AED";
  const chapters = [
    { name: "Persona", screens: [0] }, { name: "Setup", screens: [1, 2] }, { name: "Design Review", screens: [3] },
    { name: "Build", screens: [4, 5, 6] }, { name: "Audit", screens: [7, 8] }, { name: "Campaign", screens: [9, 10, 11, 12] }, { name: "Launch", screens: [13] }
  ];
  const ch = chapters.find(c => c.screens.includes(cur)) || chapters[0];
  return (
    <div style={{ height: 30, background: "#1e293b", display: "flex", alignItems: "center", padding: "0 16px", gap: 12, fontSize: 11, color: "#94a3b8", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <div style={{ width: 10, height: 10, borderRadius: 2, background: pc, flexShrink: 0 }} />
        <div style={{ width: 10, height: 10, borderRadius: 2, background: sc, flexShrink: 0 }} />
        <span style={{ color: "#e2e8f0", fontWeight: 700, marginLeft: 2 }}>{p?.companyName}</span>
      </div>
      <span style={{ color: "#334155" }}>·</span>
      <span>{p?.personaName} · {p?.personaTitle}</span>
      <span style={{ color: "#334155" }}>·</span>
      <span style={{ color: "#60a5fa", fontWeight: 600 }}>{p?.campaignName}</span>
      <div style={{ flex: 1 }} />
      <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 20, padding: "2px 10px", fontSize: 10, color: "#60a5fa", fontWeight: 600 }}>
        {ch.name} · {step || cur + 1}/{total}
      </div>
    </div>
  );
}

// ── Agent Grid ────────────────────────────────────────────────────────────────
const AGENTS = [
  { id: "jacob", initials: "JA", color: "#2563EB", name: "Jacob", role: "Website Builder", desc: "Has the ability to build website on Acquia Source", resources: 18, tags: ["Slack", "Acquia Source"], docs: ["BRAND IDENTITY_ Pulse Wellness.docx", "Brand Guidelines-Halo.docx"], extra: "+14 more", chats: 26, selected: true },
  { id: "sh", initials: "SH", color: "#E53E3E", name: "Shubham Automation", role: "Compliance and Governance Officer", desc: "Automated and manual tests on audit", resources: 1, tags: ["Acquia Source"], chats: 0 },
  { id: "no", initials: "NO", color: "#718096", name: "NoBaseIns", role: "NoBaseIns", desc: "NoBaseIns", resources: 0, chats: 0, noRes: true },
  { id: "na", initials: "NA", color: "#F59E0B", name: "Nadeem Test Persona", role: "Security Specialist", desc: "The SEO and security specialist", resources: 0, chats: 0 },
  { id: "nb", initials: "NB", color: "#F59E0B", name: "Nadeem - Builder", role: "Website Builder", desc: "A person that builds high-quality websites", resources: 0, chats: 0 },
  { id: "tn", initials: "T", color: "#0891B2", name: "TestNova Dev", role: "TestNova Dev", desc: "TestNova Dev", resources: 1, tags: ["Acquia Source"], chats: 0 },
];

function AgentCard({ agent }) {
  return (
    <div style={{ border: agent.selected ? "2px solid #DBEAFE" : "1px solid #e5e7eb", borderRadius: 10, padding: 14, background: "#fff", boxShadow: agent.selected ? "0 0 0 3px #DBEAFE" : "none", position: "relative" }}>
      {agent.selected && <span style={{ position: "absolute", top: 10, right: 10, background: "#2563EB", color: "#fff", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>✓</span>}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: agent.color, color: "#fff", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>{agent.initials}</div>
        <div><div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{agent.name}</div><div style={{ fontSize: 11, color: "#6b7280" }}>{agent.role}</div></div>
      </div>
      <div style={{ fontSize: 11, color: "#374151", marginBottom: 8, lineHeight: 1.4 }}>{agent.desc}</div>
      {agent.noRes ? (
        <><div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>◫ 0 resources</div><div style={{ fontSize: 11, color: "#9ca3af" }}>No resources configured.</div></>
      ) : (
        <>
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>◫ {agent.resources} resource{agent.resources !== 1 ? "s" : ""}</div>
          {agent.tags?.map(t => <span key={t} style={{ background: "#EFF6FF", color: "#2563EB", border: "1px solid #DBEAFE", borderRadius: 4, padding: "1px 7px", fontSize: 10, marginRight: 4, fontWeight: 500 }}>{t}</span>)}
          {agent.docs?.map(d => <div key={d} style={{ fontSize: 10, color: "#374151", marginTop: 4 }}>{d}</div>)}
          {agent.extra && <div style={{ fontSize: 10, color: "#6b7280" }}>{agent.extra}</div>}
        </>
      )}
      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 8 }}>💬 {agent.chats} chats</div>
    </div>
  );
}

// 100% verified working Unsplash IDs to use as safety fallbacks
const FALLBACK_IDS = [
  "1497366216548-37526070297c", "1522071820081-009f0129c71c", "1454165804606-c3d57bc86b40", "1515169061895-373a0e5b0260",
  "1521737604893-d14cc237f11d", "1507679622140-615266c150fa", "1552664730-d307ca884978", "1531482615713-2defd0a5192b"
];

function AssetCard({ idx, damImages, keywords, primary, secondary, selected, fileName }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const kw = keywords?.[idx % (keywords?.length || 1)] || "asset";
  const cols = [primary, secondary, primary, secondary, secondary, primary, secondary, primary];
  const col = cols[idx] || primary || "#0076BD";
  const col2 = cols[(idx + 1) % cols.length] || secondary || "#7C3AED";
  const name = fileName || `${kw.toLowerCase().replace(/ /g, "-")}-${2400 + idx * 137}.jpg`;

  // Direct index — no retry cycling that causes duplicates across cards
  const currentSrc = damImages?.[idx] || null;

  return (
    <div style={{ background: "#fff", border: selected ? `2px solid ${primary}` : "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", cursor: "pointer" }}>
      <div style={{ position: "relative", width: "100%", paddingBottom: "70%", overflow: "hidden" }}>
        {/* Always render the gradient placeholder */}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${col} 0%, ${col2} 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.9)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", textAlign: "center", padding: "0 12px" }}>{kw}</div>
          <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.4)" }} />
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{name.split("-").slice(-1)[0]}</div>
        </div>
        {/* Real image on top — fades in if it loads, falls back to gradient on error */}
        {currentSrc && !failed && (
          <img
            src={currentSrc}
            alt={kw}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: loaded ? 1 : 0, transition: "opacity 0.4s" }}
          />
        )}
        {/* Checkbox */}
        <div style={{ position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: 4, background: selected ? primary : "rgba(255,255,255,0.88)", border: selected ? "none" : "1px solid rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,.18)", zIndex: 2 }}>
          {selected && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
        </div>
      </div>
      <div style={{ padding: "8px 10px" }}>
        <div style={{ fontSize: 11, color: "#374151", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "#6b7280" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 3, cursor: "pointer" }}>
            <input type="checkbox" checked={selected} readOnly style={{ accentColor: primary, width: 11, height: 11 }} /> Select
          </label>
          <span style={{ cursor: "pointer" }}>↗ Share</span>
          <span style={{ cursor: "pointer" }}>↓ Download</span>
        </div>
      </div>
    </div>
  );
}
// ── SCREENS ───────────────────────────────────────────────────────────────────

function Screen1({ p }) {
  const pc = p.primaryColor || "#0076BD";
  const inks = initials(p.personaName);
  const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(p.url || "")}`;
  const [faviconOk, setFaviconOk] = useState(true);
  return (
    <div style={{ flex: 1, background: "linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ maxWidth: 840, width: "100%", display: "flex", gap: 48, alignItems: "flex-start" }}>
        <div style={{ flex: 6 }} className="su">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ height: 2, width: 24, background: `linear-gradient(90deg,${pc},${p.secondaryColor || "#7C3AED"})`, borderRadius: 1 }} />
            <span style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: 2, fontWeight: 600 }}>Today's story</span>
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 800, color: "#111827", marginBottom: 6, lineHeight: 1.15 }}>{ip("Meet {who}", p)}</h1>
          <div style={{ fontSize: 16, fontWeight: 600, color: pc, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            {ip("{role}", p)}
            <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 400 }}>at</span>
            {faviconOk && p.url && (
              <img src={faviconUrl} width={18} height={18} style={{ borderRadius: 3, verticalAlign: "middle" }} onError={() => setFaviconOk(false)} alt="" />
            )}
            <span style={{ color: pc }}>{ip("{co}", p)}</span>
          </div>
          <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.75, marginBottom: 22 }}>
            {ip("{who} needs to launch a new site for {co} — and add the {ca} campaign page before the end of the week. She has Jacob, Acquia's AI Website Builder. Here's what happens next.", p)}
          </p>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: `${pc}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚡</div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>The challenge</span>
            </div>
            <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, marginBottom: 10 }}>
              {ip("{co} needs to establish a compelling digital presence in the {ind} space — fast. {who} must build a brand-ready site, add the {ca} campaign page, and publish it this week.", p)}
            </div>
            <div style={{ background: `${pc}08`, border: `1px solid ${pc}22`, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: pc, fontWeight: 500, lineHeight: 1.5 }}>
              🔔 <strong>Urgent trigger:</strong> {p.urgentCampaignTrigger}
            </div>
          </div>
        </div>
        <div style={{ flex: 4 }} className="si">
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 28, textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,.08)" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg,${pc},${p.secondaryColor || "#7C3AED"})`, color: "#fff", fontWeight: 800, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>{inks}</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#111827", marginBottom: 4 }}>{p.personaName}</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 14 }}>{p.personaTitle}</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${pc}10`, border: `1px solid ${pc}25`, borderRadius: 20, padding: "5px 14px" }}>
              {faviconOk && p.url && (
                <img src={faviconUrl} width={14} height={14} style={{ borderRadius: 2 }} onError={() => setFaviconOk(false)} alt="" />
              )}
              <span style={{ fontSize: 12, fontWeight: 600, color: pc }}>{p.companyName}</span>
            </div>
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { icon: "🏢", label: "Industry", val: p.industry },
                { icon: "🎯", label: "Campaign", val: p.campaignName },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", alignItems: "flex-start", gap: 8, textAlign: "left" }}>
                  <span style={{ fontSize: 14, marginTop: 1 }}>{row.icon}</span>
                  <div>
                    <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: .5, fontWeight: 600 }}>{row.label}</div>
                    <div style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{row.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Screen2({ p }) {
  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      <Sidebar aiOpen active="conversations" p={p} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#f9fafb", overflow: "auto" }} className="scroll">
        <TopBar crumbs={["AI", "Conversations"]} />
        <div style={{ flex: 1, padding: "24px 40px" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 4, textAlign: "center" }}>Choose Your Acquia Agent</h2>
          <p style={{ fontSize: 13, color: "#6b7280", textAlign: "center", marginBottom: 16 }}>Select an agent to start your conversation.</p>
          <div style={{ border: "2px dashed #d1d5db", borderRadius: 10, padding: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: "#374151", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><span>📍</span> New to Acquia AI?</div>
              <button style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Learn how Acquia AI works</button>
            </div>
            <button style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 16 }}>✕</button>
          </div>
          <button style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontWeight: 600, marginBottom: 20 }}>💬 Start Chat</button>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {AGENTS.map(a => <AgentCard key={a.id} agent={a} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function Screen3({ p }) {
  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      <Sidebar aiOpen active="new-chat" p={p} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff", overflow: "hidden" }}>
        <TopBar crumbs={["AI", "New chat"]} />
        <ChatHeader />
        <div style={{ flex: 1, padding: "20px 24px", overflow: "auto" }} className="scroll">
          <AgentMsg text="Hi! What can I help you with today?" p={p} />
        </div>
        <ChatInput value={ip("Build the {co} site from our Figma design — WCAG AA compliant, optimised for AI answer engines.", p)} p={p} />
      </div>
    </div>
  );
}

function Screen4({ p }) {
  const pc = p.primaryColor || "#0076BD";
  const [scanDone, setScanDone] = useState(false);
  const [ann1, setAnn1] = useState(false);
  const [ann2, setAnn2] = useState(false);
  const [screenshotFailed, setScreenshotFailed] = useState(false);

  // Only use the screenshot if Microlink successfully rendered the real page.
  // If Microlink was blocked (access denied, Cloudflare, etc.), screenshotFromMicrolink=false
  // and screenshotUrl is the thum.io fallback which often shows an error/block page.
  const screenshotUrl = p.screenshotFromMicrolink ? p.screenshotUrl : null;

  useEffect(() => {
    const t1 = setTimeout(() => setScanDone(true), 1200);
    const t2 = setTimeout(() => setAnn1(true), 1800);
    const t3 = setTimeout(() => setAnn2(true), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#1a1a2e", overflow: "hidden" }}>
      <div style={{ height: 48, background: "#2c2c2c", display: "flex", alignItems: "center", padding: "0 16px", gap: 24, flexShrink: 0, borderBottom: "1px solid #111", zIndex: 50 }}>
        <div style={{ width: 32, height: 32, borderRadius: 4, background: "#F24E1E", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16, boxShadow: "0 4px 6px rgba(0,0,0,0.3)" }}>F</div>
        <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>
          <span style={{ color: "#fff" }}>Design</span><span>Prototype</span><span>Inspect</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ background: "#383838", borderRadius: 6, padding: "4px 12px", fontSize: 11, color: "#d1d5db", border: "1px solid transparent" }}>
          {ip("{co} — Brand Site Design.fig", p)}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#383838", padding: "4px 8px", borderRadius: 4, fontSize: 11, color: "#d1d5db" }}>
            <span style={{ fontWeight: "bold" }}>-</span><span>60%</span><span style={{ fontWeight: "bold" }}>+</span>
          </div>
          <button style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 4, padding: "6px 12px", fontSize: 11, fontWeight: "bold", cursor: "pointer" }}>Share</button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ width: 240, background: "#2c2c2c", borderRight: "1px solid #333", padding: 16, display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ fontSize: 9, color: "#999", fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Layers</div>
          <div style={{ flex: 1, overflow: "auto" }} className="scroll">
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#60a5fa", fontWeight: 500, fontSize: 11, marginBottom: 12 }}>
              <span style={{ fontSize: 14 }}>◫</span> Desktop - Main
            </div>
            {[
              { label: "Header_Navigation" },
              { label: "Hero_Section" },
              { label: "Content_Body" },
              { label: "Footer_Global" },
            ].map((l, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 20, fontSize: 11, color: "#9ca3af", marginBottom: 12 }}>
                <span style={{ fontSize: 10 }}>#</span> {l.label}
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", background: "#1e1e1e", backgroundImage: "radial-gradient(#333 1px, transparent 1px)", backgroundSize: "32px 32px" }}>

          {/* Wrapper clips to exact visual size — prevents horizontal overflow */}
          <div style={{ position: "relative", width: "896px", height: "560px", flexShrink: 0, overflow: "hidden", boxShadow: "0 0 0 1px #333, 0 30px 60px rgba(0,0,0,0.5)" }}>
            {/* 1280×800 canvas scaled 0.7x from top-left → fills wrapper exactly */}
            <div style={{ width: "1280px", height: "800px", background: "white", position: "absolute", top: 0, left: 0, transform: "scale(0.7)", transformOrigin: "top left" }}>

              {screenshotUrl && !screenshotFailed ? (
                <img
                  src={screenshotUrl}
                  alt={`${p.companyName} website`}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
                  onError={() => setScreenshotFailed(true)}
                />
              ) : (
                <BrandedMockup p={p} />
              )}

              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", border: `4px solid ${pc}`, opacity: scanDone ? 1 : 0, transition: "opacity 0.3s", zIndex: 10 }}></div>

              {!scanDone && (
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 10 }}>
                  <div style={{ position: "absolute", left: 0, right: 0, height: 4, background: `linear-gradient(90deg,transparent,${pc},transparent)`, animation: "scanLine 1.2s ease forwards", top: 0, boxShadow: `0 0 15px ${pc}` }} />
                </div>
              )}
            </div>
          </div>

          {ann1 && (
            <div className="su" style={{ position: "absolute", top: "10%", right: "8%", background: "#fff", borderRadius: 8, padding: "8px 14px", boxShadow: "0 4px 20px rgba(0,0,0,.3)", fontSize: 11, fontWeight: 600, color: "#059669", display: "flex", alignItems: "center", gap: 6, border: "1px solid #D1FAE5" }}>
              <span style={{ fontSize: 14 }}>✓</span> Brand tokens extracted
            </div>
          )}
          {ann2 && (
            <div className="su" style={{ position: "absolute", bottom: "8%", left: "8%", background: "#fff", borderRadius: 8, padding: "8px 14px", boxShadow: "0 4px 20px rgba(0,0,0,.3)", fontSize: 11, fontWeight: 600, color: "#2563EB", display: "flex", alignItems: "center", gap: 6, border: "1px solid #DBEAFE" }}>
              <span style={{ fontSize: 14 }}>✓</span> Layout mapped — 4 components identified
            </div>
          )}
        </div>

        <div style={{ width: 260, background: "#2c2c2c", borderLeft: "1px solid #333", padding: "14px 16px", flexShrink: 0, display: "flex", flexDirection: "column", color: "#fff", fontSize: 11, overflow: "auto" }} className="scroll">
          <div style={{ fontSize: 9, color: "#999", fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Brand Tokens — Extracted Live</div>

          {/* OG Image preview */}
          {(p.rawMeta?.ogImage || (p.imageUrls||[])[0]) && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 9, color: "#999", textTransform: "uppercase", fontWeight: "bold", letterSpacing: 1, display: "block", marginBottom: 6 }}>Hero Image</label>
              <img
                src={p.rawMeta?.ogImage || p.imageUrls[0]}
                alt="og"
                style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 4, display: "block", border: "1px solid #444" }}
                onError={e => e.target.style.display = "none"}
              />
            </div>
          )}

          {/* Meta title */}
          {(p.rawMeta?.title || p.rawMeta?.ogTitle) && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 9, color: "#999", textTransform: "uppercase", fontWeight: "bold", letterSpacing: 1, display: "block", marginBottom: 4 }}>Page Title</label>
              <div style={{ background: "#383838", padding: "6px 8px", borderRadius: 4, border: "1px solid #444", color: "#e5e7eb", lineHeight: 1.4, fontSize: 10 }}>
                {(p.rawMeta?.ogTitle || p.rawMeta?.title || "").slice(0, 60)}
              </div>
            </div>
          )}

          {/* Meta description */}
          {(p.rawMeta?.desc || p.rawMeta?.ogDesc) && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 9, color: "#999", textTransform: "uppercase", fontWeight: "bold", letterSpacing: 1, display: "block", marginBottom: 4 }}>Meta Description</label>
              <div style={{ background: "#383838", padding: "6px 8px", borderRadius: 4, border: "1px solid #444", color: "#9ca3af", lineHeight: 1.4, fontSize: 10 }}>
                {(p.rawMeta?.desc || p.rawMeta?.ogDesc || "").slice(0, 100)}…
              </div>
            </div>
          )}

          <hr style={{ borderColor: "#444", margin: "10px 0" }} />

          {/* Color palette */}
          <label style={{ fontSize: 9, color: "#999", textTransform: "uppercase", fontWeight: "bold", letterSpacing: 1, display: "block", marginBottom: 8 }}>Color Palette</label>
          {[["Primary", pc], ["Secondary", p.secondaryColor || "#7C3AED"]].map(([label, color]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, background: "#383838", padding: "6px 8px", borderRadius: 4, border: "1px solid #444", marginBottom: 6 }}>
              <div style={{ width: 18, height: 18, background: color, border: "1px solid #555", borderRadius: 3, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: "#6b7280", width: 52 }}>{label}</span>
              <span style={{ fontSize: 10, fontFamily: "monospace", color: "#e5e7eb" }}>{color}</span>
            </div>
          ))}

          <hr style={{ borderColor: "#444", margin: "10px 0" }} />

          {/* Detected assets */}
          <label style={{ fontSize: 9, color: "#999", textTransform: "uppercase", fontWeight: "bold", letterSpacing: 1, display: "block", marginBottom: 8 }}>Detected Assets</label>
          {[
            ["Images found", `${(p.imageUrls||[]).length} CDN assets`],
            ["Nav items", `${(p.navLinks||[]).length} links`],
            ["H1 headline", p.rawMeta?.h1 ? "✓ extracted" : "✓ AI-inferred"],
            ["Brand keywords", `${(p.assetKeywords||[]).length} keywords`],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, color: "#9ca3af" }}>
              <span>{k}</span><span style={{ color: "#e5e7eb", fontWeight: 600 }}>{v}</span>
            </div>
          ))}

          <div style={{ flex: 1 }} />
          <button style={{ width: "100%", background: pc, color: cc(pc), border: "none", borderRadius: 6, padding: "10px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", marginTop: 14 }}>Confirm & Build →</button>
        </div>
      </div>
    </div>
  );
}



function Screen5({ p }) {
  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      <Sidebar aiOpen active="conversations" p={p} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff", overflow: "hidden" }}>
        <TopBar crumbs={["AI", "Conversations"]} />
        <ChatHeader />
        <div style={{ flex: 1, padding: "20px 24px", overflow: "auto" }} className="scroll">
          <AgentMsg p={p} text={ip("Here's my plan to build the {co} site using the Multi Brand Site Template as the foundation. I'll provision a fresh environment, build the full structure with content types, content, and Canvas pages — mirroring your Figma layout and {co} brand design.", p)} />
          <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 18px", marginBottom: 16, marginLeft: 42 }}>
            <PlanStep n={1} title="Provision a new site" desc={ip('Create a new Acquia Source environment for "{co}" using the Multi Brand Site Template.', p)} p={p} />
            <PlanStep n={2} title="Schema — Taxonomy & Content Types" desc={ip("Create vocabularies and content types (Brand, Product, Article) to support the {co} {ind} site structure.", p)} p={p} />
            <PlanStep n={3} title={ip("Content — {co} Brands & Products", p)} desc={ip("Create {co} brand entries with logos, hero images, and brand colours. Create {ind} product/service entries in draft state.", p)} p={p} />
            <PlanStep n={4} title="Run WCAG 2.1 Accessibility Audit" desc="Use Web Governance to audit all pages for WCAG AA compliance before publishing." p={p} />
            <PlanStep n={5} title={ip("Assemble & Publish", p)} desc={ip("Build Canvas pages, set {co} homepage, update navigation, and publish live.", p)} p={p} />
            <div style={{ marginTop: 12, fontSize: 13, color: "#374151" }}>Shall I proceed?</div>
            <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "#6b7280" }}>Skills identified:</span>
              <SkillBadge label="canvas-page-builder" /><SkillBadge label="acquia-content-modeling" /><SkillBadge label="web-governance" />
            </div>
          </div>
          <UserMsg text="2. No, build the new site." p={p} />
        </div>
        <ChatInput placeholder="Message Jacob…" p={p} />
      </div>
    </div>
  );
}

function Screen6({ p }) {
  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      <Sidebar aiOpen active="conversations" p={p} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff", overflow: "hidden" }}>
        <TopBar crumbs={["AI", "Conversations"]} />
        <ChatHeader />
        <div style={{ flex: 1, padding: "20px 24px", overflow: "auto" }} className="scroll">
          <UserMsg text={ip("Build the {co} site from our Figma design — WCAG AA compliant, optimised for AI answer engines.", p)} p={p} />
          <ExecMsg step={1} total={5} pct={18} text={ip('Provision a new site — Creating the "{co}" environment. Configuring workspace and preview. Installing the Multi Brand Site Template.', p)} p={p} />
          <ExecMsg step={2} total={5} pct={44} text={ip("Schema — Creating taxonomy vocabularies and content types for {co}'s {ind} site. Setting up Brand, Product, and Article content types.", p)} p={p} />
          <ExecMsg step={3} total={5} pct={68} text={ip("Content — Creating {co} brand entries with logos, hero images, taglines, and brand colours. Creating {ind} product/service entries using assets from the {co} DAM.", p)} p={p} />
        </div>
        <ChatInput placeholder="Message Jacob…" p={p} />
      </div>
    </div>
  );
}

function Screen7({ p }) {
  const pc = p.primaryColor || "#0076BD";
  const sc = p.secondaryColor || "#7C3AED";
  const co = p.companyName || "Company";

  const faviconUrl = p.url ? `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(p.url)}` : null;

  // thum.io works as <img src> with no CORS — siteUrl is the page to screenshot
  const siteCards = [
    { name: ip("{co} Site", p), domain: `${co.toLowerCase().replace(/\s/g, "")}.acquia.site`, isProspect: true },
    { name: "Valvoline Global", domain: "valvolineglobal.com",  siteUrl: "https://www.valvolineglobal.com/en-in/" },
    { name: "Eud.ai",           domain: "eud.ai",               siteUrl: "https://www.eud.ai/" },
    { name: "eBikes DAM",       domain: "ebikesdam.com",        siteUrl: "https://ebikesdam.com/dam/login" },
    { name: "Starbucks",        domain: "starbucks.com",        siteUrl: "https://www.starbucks.com" },
    { name: "Salesforce",       domain: "salesforce.com",       siteUrl: "https://www.salesforce.com" },
    { name: "Shopify",          domain: "shopify.com",          siteUrl: "https://www.shopify.com" },
    { name: "HubSpot",          domain: "hubspot.com",          siteUrl: "https://www.hubspot.com" },
  ];

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      <Sidebar active="sites" p={p} />
      <div style={{ flex: 1, background: "#fff", overflow: "auto", padding: 24 }} className="scroll">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>Sites</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <select style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 10px", fontSize: 12 }}><option>Internal Acquia Source / AM-493...</option></select>
            <button style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 8px" }}>⊞</button>
            <button style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 8px" }}>☰</button>
            <button style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Create Site</button>
          </div>
        </div>
        <input placeholder="Search by site label or domain" style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 12px", width: 260, fontSize: 12, marginBottom: 20 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {siteCards.map((card, i) => (
            <SiteCard key={i} card={card} pc={pc} sc={sc} co={co} p={p} faviconUrl={faviconUrl} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Scales the BrandedMockup (1280×800) into the 140px-tall card thumbnail
function ProspectSiteThumb({ p }) {
  const scale = 0.225; // 1280 × 0.225 ≈ 288px wide — fills a 4-col grid card
  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative", background: p.primaryColor || "#111" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 1280, height: 800, transform: `scale(${scale})`, transformOrigin: "top left", pointerEvents: "none" }}>
        <BrandedMockup p={p} />
      </div>
    </div>
  );
}

// Creative mini-website wireframe rendered in JSX — used as fallback for static cards
function MockSiteThumb({ name }) {
  const hash = name.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0);
  const hue = Math.abs(hash) % 360;
  const pc = `hsl(${hue}, 52%, 36%)`;
  const pc2 = `hsl(${(hue + 28) % 360}, 58%, 50%)`;
  return (
    <div style={{ width: "100%", height: "100%", background: "#f1f5f9", overflow: "hidden", fontFamily: "system-ui, sans-serif" }}>
      {/* Browser chrome */}
      <div style={{ height: 16, background: "#e2e8f0", borderBottom: "1px solid #cbd5e1", display: "flex", alignItems: "center", padding: "0 6px", gap: 4 }}>
        {["#f87171","#fbbf24","#4ade80"].map((c,i) => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: c }} />)}
        <div style={{ flex: 1, height: 7, background: "#fff", borderRadius: 10, margin: "0 6px", border: "1px solid #e2e8f0" }} />
      </div>
      {/* Nav */}
      <div style={{ height: 18, background: pc, display: "flex", alignItems: "center", padding: "0 8px", gap: 6 }}>
        <div style={{ width: 38, height: 6, background: "rgba(255,255,255,0.92)", borderRadius: 2 }} />
        <div style={{ flex: 1 }} />
        {[24,20,28,20].map((w,i) => <div key={i} style={{ width: w, height: 4, background: "rgba(255,255,255,0.4)", borderRadius: 2 }} />)}
        <div style={{ width: 32, height: 13, background: "rgba(255,255,255,0.2)", borderRadius: 2, border: "1px solid rgba(255,255,255,0.4)" }} />
      </div>
      {/* Hero gradient */}
      <div style={{ height: 50, background: `linear-gradient(135deg, ${pc} 0%, ${pc2} 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
        <div style={{ width: 72, height: 6, background: "rgba(255,255,255,0.95)", borderRadius: 3 }} />
        <div style={{ width: 52, height: 4, background: "rgba(255,255,255,0.5)", borderRadius: 2 }} />
        <div style={{ display: "flex", gap: 5, marginTop: 2 }}>
          <div style={{ width: 34, height: 12, background: "rgba(255,255,255,0.9)", borderRadius: 2 }} />
          <div style={{ width: 34, height: 12, background: "rgba(255,255,255,0.2)", borderRadius: 2, border: "1px solid rgba(255,255,255,0.5)" }} />
        </div>
      </div>
      {/* Content cards row */}
      <div style={{ display: "flex", gap: 5, padding: "6px 6px 0" }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ flex: 1, background: "#fff", borderRadius: 3, overflow: "hidden", border: "1px solid #e2e8f0" }}>
            <div style={{ height: 22, background: `linear-gradient(${i % 2 ? pc2 : pc}, rgba(255,255,255,0))`, opacity: 0.3 }} />
            <div style={{ padding: "3px 4px" }}>
              <div style={{ width: "70%", height: 3, background: "#94a3b8", borderRadius: 2, marginBottom: 2 }} />
              <div style={{ width: "90%", height: 2.5, background: "#e2e8f0", borderRadius: 2, marginBottom: 1.5 }} />
              <div style={{ width: "55%", height: 2.5, background: "#e2e8f0", borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
      {/* Footer strip */}
      <div style={{ height: 12, background: pc, marginTop: 6, opacity: 0.8 }} />
    </div>
  );
}

function SiteCard({ card, pc, sc, co, p, faviconUrl }) {
  const [mlUrl, setMlUrl] = useState(null);
  const [mlFailed, setMlFailed] = useState(false);
  const [mlLoading, setMlLoading] = useState(!card.isProspect);

  useEffect(() => {
    if (card.isProspect) return;
    const target = card.siteUrl || `https://${card.domain}`;
    fetch(`https://api.microlink.io?url=${encodeURIComponent(target)}&screenshot=true`, {
      signal: AbortSignal.timeout(15000)
    })
      .then(r => r.json())
      .then(d => {
        const url = d?.data?.screenshot?.url;
        if (url) setMlUrl(url);
        else setMlFailed(true);
      })
      .catch(() => setMlFailed(true))
      .finally(() => setMlLoading(false));
  }, [card.domain]);

  const renderThumb = () => {
    if (card.isProspect) return <ProspectSiteThumb p={p} />;
    if (mlLoading) return (
      <div style={{ width: "100%", height: "100%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 22, height: 22, border: "2px solid #e2e8f0", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.75s linear infinite" }} />
      </div>
    );
    if (mlUrl && !mlFailed) return (
      <img
        src={mlUrl}
        alt={card.name}
        onError={() => setMlFailed(true)}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
      />
    );
    return <MockSiteThumb name={card.name} />;
  };

  return (
    <div style={{ border: card.isProspect ? `2px solid ${pc}` : "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", boxShadow: card.isProspect ? `0 0 0 3px ${pc}22` : "none" }}>
      <div style={{ height: 140, position: "relative", overflow: "hidden" }}>
        {renderThumb()}
        {card.isProspect && (
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.45) 100%)" }}>
            <div style={{ position: "absolute", top: 8, right: 8, background: "#059669", color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 4, padding: "2px 8px" }}>NEW - Live</div>
          </div>
        )}
      </div>
      <div style={{ padding: "10px 12px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#2563EB", marginBottom: 2 }}>{card.name}</div>
        <div style={{ fontSize: 11, color: "#2563EB", marginBottom: 6 }}>{card.domain} ↗</div>
        <span style={{ background: "#ECFDF5", color: "#059669", fontSize: 10, fontWeight: 600, borderRadius: 4, padding: "2px 8px" }}>Public</span>
        <div style={{ marginTop: 8 }}>
          <button style={{ border: "1px solid #e5e7eb", background: "#fff", borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer" }}>Edit Site</button>
        </div>
      </div>
    </div>
  );
}

function Screen8({ p }) {
  const scores = [
    { label: "Accessibility", score: 96, color: "#10B981", pill: "WCAG AA" },
    { label: "SEO", score: 91, color: "#3B82F6" },
    { label: "Performance", score: 88, color: "#F59E0B" },
    { label: "Best Practices", score: 94, color: "#8B5CF6" },
  ];
  const checks = [
    { ok: true, label: "Color contrast ratio", desc: "All elements pass WCAG AA 4.5:1 ratio" },
    { ok: true, label: "Alt text on images", desc: "100% of images have descriptive alt text" },
    { ok: true, label: "Keyboard navigation", desc: "Full keyboard navigability confirmed" },
    { ok: true, label: "ARIA labels", desc: "All interactive elements properly labelled" },
    { ok: false, label: "Focus visible", desc: "2 minor focus indicator improvements suggested" },
  ];
  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      <Sidebar aiOpen active="conversations" p={p} />
      <div style={{ flex: 1, background: "#f9fafb", overflow: "auto", padding: 24 }} className="scroll">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 19, fontWeight: 700, color: "#111827" }}>{ip("{co} — Accessibility Report", p)}</h2>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{new Date().toLocaleDateString()}</div>
          </div>
          <div style={{ background: "linear-gradient(135deg,#059669,#10B981)", borderRadius: 8, padding: "8px 14px", color: "#fff", fontWeight: 700, fontSize: 12, textAlign: "center", lineHeight: 1.6 }}>
            WCAG 2.1<br />AA<br />COMPLIANT ✓
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
          {scores.map(s => (
            <div key={s.label} style={{ background: "#fff", border: `1px solid #e5e7eb`, borderTop: `3px solid ${s.color}`, borderRadius: 8, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.score}</div>
              <div style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>{s.label}</div>
              {s.pill && <span style={{ background: "#ECFDF5", color: "#059669", fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "2px 8px", marginTop: 4, display: "inline-block" }}>{s.pill}</span>}
            </div>
          ))}
        </div>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
          {checks.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderBottom: i < checks.length - 1 ? "1px solid #f3f4f6" : "none" }}>
              <span style={{ fontSize: 18, marginTop: 1 }}>{c.ok ? "✅" : "⚠️"}</span>
              <div><div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{c.label}</div><div style={{ fontSize: 12, color: "#6b7280" }}>{c.desc}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Screen9({ p }) {
  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      <Sidebar aiOpen active="conversations" p={p} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff", overflow: "hidden" }}>
        <TopBar crumbs={["AI", "Conversations"]} />
        <ChatHeader />
        <div style={{ flex: 1, padding: "20px 24px", overflow: "auto" }} className="scroll">
          <UserMsg text={ip("Build the {co} site from our Figma design — WCAG AA compliant, optimised for AI answer engines.", p)} p={p} />
          <AgentMsg p={p}
            thinking={ip("Site provisioned, {ind} content created, Canvas pages assembled, accessibility audit passed, DNS updated. The {co} site is live.", p)}
            text={ip("✓ The {co} site is live. WCAG AA compliant, AEO-structured, and built without writing a single line of code. The site is now indexed and ready to be cited by AI answer engines.", p)}
          />
        </div>
        <ChatInput placeholder="Message Jacob…" p={p} />
      </div>
    </div>
  );
}

function Screen10({ p }) {
  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      <Sidebar aiOpen active="conversations" p={p} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff", overflow: "hidden", position: "relative" }}>
        <TopBar crumbs={["AI", "Conversations"]} />
        <ChatHeader />
        <div style={{ flex: 1, padding: "20px 24px", overflow: "auto" }} className="scroll">
          <UserMsg text={ip("Build the {co} site from our Figma design — WCAG AA compliant, optimised for AI answer engines.", p)} p={p} />
          <AgentMsg p={p}
            thinking={ip("Site provisioned, {ind} content created, Canvas pages assembled, accessibility audit passed, DNS updated. The {co} site is live.", p)}
            text={ip("✓ The {co} site is live. WCAG AA compliant, AEO-structured, and built without writing a single line of code.", p)}
          />
          <UserMsg text={ip("Add a {ca} page to the {co} site.", p)} p={p} />
        </div>
        <ChatInput value={ip("Add a {ca} page to the {co} site.", p)} p={p} />
        <div className="ni" style={{ position: "absolute", top: 70, right: 18, background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 10, padding: "10px 14px", maxWidth: 300, boxShadow: "0 4px 16px rgba(0,0,0,.12)", zIndex: 100 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ fontSize: 20 }}>🔔</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#92400E", marginBottom: 3 }}>Launch date moved up!</div>
              <div style={{ fontSize: 11, color: "#78350F", lineHeight: 1.5 }}>
                {ip(p.urgentCampaignTrigger + " — the {ca} launch needs to happen today.", p)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Screen11({ p }) {
  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      <Sidebar aiOpen active="conversations" p={p} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff", overflow: "hidden" }}>
        <TopBar crumbs={["AI", "Conversations"]} />
        <ChatHeader />
        <div style={{ flex: 1, padding: "20px 24px", overflow: "auto" }} className="scroll">
          <AgentMsg p={p} text={ip("I can see you already have the {co} site. I'll add the {ca} page directly to it. Here's my plan:", p)} />
          <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 18px", marginBottom: 16, marginLeft: 42 }}>
            <PlanStep n={1} title={ip("Search {co} DAM for {ca} assets", p)} desc={ip("Identify and validate brand-aligned {ind} images for the {ca} campaign against {co} brand standards.", p)} p={p} />
            <PlanStep n={2} title={ip("Build the {ca} page", p)} desc={ip("Use the existing {co} design system — same Canvas layout, components, and brand tokens — to build the {ca} campaign page.", p)} p={p} />
            <PlanStep n={3} title="Create AEO-ready content cluster" desc={ip("Use the Writing Assistant to structure {ind} content so {ca} is cited in AI search results by customers searching for {ind} solutions.", p)} p={p} />
            <PlanStep n={4} title="Add to site & update navigation" desc={ip("Add the {ca} page to the {co} site and update the navigation menu automatically.", p)} p={p} />
            <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "#6b7280" }}>Skills identified:</span>
              <SkillBadge label="canvas-page-builder" /><SkillBadge label="conductor-writing-assistant" /><SkillBadge label="acquia-dam" />
            </div>
          </div>
          <UserMsg text={ip("Add a {ca} page to the {co} site.", p)} p={p} />
        </div>
        <ChatInput placeholder="Message Jacob…" p={p} />
      </div>
    </div>
  );
}

// Filenames that match each IMAGE_DICT industry's actual photo content
const DAM_FILE_LABELS = {
  "food & beverage":       ["iced-coffee-cup","latte-art-craft","espresso-portafilter","coffee-bean-closeup","overhead-black-coffee","coffee-beans-scoop","pour-over-drip","cafe-interior-warmth"],
  "retail & commerce":     ["product-hero-shot","brand-campaign-visual","store-lifestyle","new-collection-drop","fashion-editorial","brand-packshot","retail-moment","campaign-asset"],
  "healthcare & wellness": ["patient-digital-care","clinical-technology","wellness-moment","healthcare-team","medical-innovation","patient-experience","telehealth-session","care-pathway"],
  "financial services":    ["digital-banking-app","wealth-management","fintech-interface","investment-growth","banking-mobile","financial-advisor","secure-transaction","market-insights"],
  "automotive":            ["vehicle-launch-hero","driving-experience","ev-innovation","interior-detail","brand-campaign","showroom-digital","fleet-overview","performance-capture"],
  "education":             ["campus-life","learning-experience","student-success","digital-classroom","research-lab","graduation-day","academic-excellence","future-ready"],
  "travel & hospitality":  ["destination-hero","luxury-property","guest-experience","travel-lifestyle","hotel-amenities","adventure-moment","booking-journey","loyalty-reward"],
  "enterprise technology": ["platform-dashboard","team-collaboration","cloud-infrastructure","data-insights","product-launch","enterprise-workflow","ai-analytics","digital-transformation"],
  "sports & fitness":      ["athlete-in-motion","training-session","gym-performance","race-day-hero","fitness-lifestyle","sport-action-shot","team-performance","active-lifestyle"],
  "beauty & cosmetics":    ["skincare-hero","makeup-editorial","product-flatlay","beauty-portrait","routine-moment","cosmetics-closeup","fragrance-campaign","glow-up-campaign"],
  "luxury & accessories":  ["watch-hero-shot","jewelry-editorial","accessory-lifestyle","timepiece-detail","luxury-campaign","product-closeup","brand-aesthetic","collection-launch"],
  "default":               ["brand-hero-shot","campaign-visual","product-lifestyle","team-collaboration","digital-experience","customer-moment","brand-identity","marketing-asset"],
};

function Screen12({ p, damImages }) {
  const pc = p.primaryColor || "#0076BD";
  const sc = p.secondaryColor || "#7C3AED";

  // Match filenames to actual IMAGE_DICT content for this industry
  const ind = (p.industry || "default").toLowerCase();
  const ALIASES = {
    "food & beverage":       ["food","cafe","coffee","restaurant","beverage","drink","starbucks","barista","brew","roast","espresso","latte","dine","dining","grocery","snack","bakery","boba","juice","tea"],
    "healthcare & wellness": ["health","medical","pharma","clinic","wellness","hospital"],
    "financial services":    ["financ","bank","invest","insurance","fintech","wealth"],
    "automotive":            ["auto","car","vehicle","motor","drive","fleet","electric"],
    "education":             ["edu","university","college","school","learn","academ"],
    "travel & hospitality":  ["travel","hotel","hospit","resort","airline","tourism"],
    "sports & fitness":      ["sport","fitness","gym","athlet","workout","yoga","running","activewear","cricket","football","soccer","tennis","badminton","cycling","swim","puma","reebok","decathlon"],
    "beauty & cosmetics":    ["beauty","cosmetic","skincare","makeup","skin care","nykaa","salon","sephora","loreal","serum","lipstick","mascara","fragrance","perfume"],
    "luxury & accessories":  ["watch","jewel","accessory","accessories","jeweller","jewellery","fastrack","titan","tanishq","rolex","timepiece","diamond","gemstone","luxury brand"],
    "retail & commerce":     ["retail","shop","commerce","ecommerce","e-commerce","fashion","apparel","store","brand","product"],
    "enterprise technology": ["tech","software","platform","saas","digital","enterprise","cloud","ai","data"],
  };
  const industryKey = Object.keys(ALIASES).find(k => ALIASES[k].some(a => ind.includes(a))) || "default";
  const labels = DAM_FILE_LABELS[industryKey] || DAM_FILE_LABELS["default"];
  const fileNames = Array.from({ length: 8 }).map((_, i) => `${labels[i]}-${2400 + i * 137}.jpg`);

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      <Sidebar dam active="assets" p={p} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff", overflow: "hidden" }}>

        {/* Top nav bar */}
        <div style={{ height: 44, borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", padding: "0 20px", background: "#fff", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 4 }}>
            {["Categories", "Collections", "Activities"].map(b => (
              <button key={b} style={{ border: "1px solid #d1d5db", background: "#fff", borderRadius: 6, padding: "5px 13px", fontSize: 12, cursor: "pointer", color: "#374151", marginRight: 4 }}>
                {b} <span style={{ fontSize: 10, color: "#9ca3af" }}>›</span>
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <input placeholder="Search assets..." style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 12px", fontSize: 12, color: "#374151", width: 180, outline: "none" }} />
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflow: "auto", padding: "16px 20px" }} className="scroll">

          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 12 }}>
            Assets <span style={{ fontSize: 13, fontWeight: 400, color: "#6b7280" }}>(284 results)</span>
          </h2>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#374151", cursor: "pointer" }}>
                <input type="checkbox" readOnly style={{ width: 13, height: 13 }} /> Select all
              </label>
              <span style={{ fontSize: 12, color: "#6b7280" }}>viewing 1–16 of 284</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <select style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 10px", fontSize: 12, color: "#374151", background: "#fff" }}>
                <option>Relevance</option><option>Newest</option><option>Oldest</option>
              </select>
              <select style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 10px", fontSize: 12, color: "#374151", background: "#fff" }}>
                <option>200 per page</option><option>50 per page</option><option>100 per page</option>
              </select>
              <button style={{ border: "1px solid #d1d5db", background: "#fff", borderRadius: 6, padding: "4px 12px", fontSize: 12, color: "#374151", cursor: "pointer" }}>Filter</button>
            </div>
          </div>

          {/* 4-column grid — using AssetCard so useState per card is legal */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <AssetCard
                key={i}
                idx={i}
                damImages={damImages}
                keywords={p.assetKeywords}
                primary={pc}
                secondary={sc}
                selected={i < 4}
                fileName={fileNames[i]}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Screen13({ p }) {
  const titles = p.contentClusterTitles || ["Article 1", "Article 2", "Article 3", "Article 4"];
  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      <Sidebar aiOpen active="conversations" p={p} />
      <div style={{ flex: 1, background: "#f9fafb", overflow: "auto", padding: 24 }} className="scroll">
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Writing Assistant — Content Cluster</h2>
        <div style={{ background: "linear-gradient(135deg,#EFF6FF,#F5F3FF)", border: "1px solid #DBEAFE", borderRadius: 10, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1E40AF", marginBottom: 6 }}>✍️ AEO-Ready Content Cluster Generated</div>
          <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
            {ip("The Writing Assistant has created a content cluster for {ca} — structured so {co} is cited by ChatGPT, Perplexity, and every AI answer engine your {ind} customers use.", p)}
          </div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Title", "Type", "Status"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: .5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: "#EFF6FF", borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 700, color: "#111827" }}>{ip("{ca} — {co} Campaign Page", p)}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "#374151" }}>Page</td>
                <td style={{ padding: "10px 14px" }}><span style={{ background: "#ECFDF5", color: "#059669", fontSize: 11, fontWeight: 600, borderRadius: 4, padding: "2px 8px" }}>Draft</span></td>
              </tr>
              {titles.map((t, i) => (
                <tr key={i} style={{ borderBottom: i < titles.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "10px 14px", fontSize: 13, color: "#111827" }}>{t}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "#374151" }}>Article</td>
                  <td style={{ padding: "10px 14px" }}><span style={{ background: "#FFFBEB", color: "#92400E", fontSize: 11, fontWeight: 600, borderRadius: 4, padding: "2px 8px" }}>Draft</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>✓ Approve & Publish Cluster</button>
          <button style={{ background: "#fff", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>Edit</button>
        </div>
      </div>
    </div>
  );
}

// ── SCREEN 14 ─────────────────────────────────────────────────────────────────
function Screen14({ p, campHtml, damImages }) {
  const pc = p.primaryColor || "#0076BD";
  const sc = p.secondaryColor || "#7C3AED";
  const [view, setView] = useState("campaign");

  const isDark = (() => {
    try { const r=parseInt(pc.slice(1,3),16),g=parseInt(pc.slice(3,5),16),b=parseInt(pc.slice(5,7),16); return .299*r+.587*g+.114*b<60; } catch { return false; }
  })();

  const buildCampaignPage = () => {
    const co = p.companyName || "Company";
    const ca = p.campaignName || "New Campaign";
    const cd = p.campaignDescription || "Our most exciting initiative yet.";
    const ind = p.industry || "technology";
    const prods = p.products || ["Product One", "Product Two", "Product Three"];
    const navs = (p.navLinks || ["Home","Products","About","Contact"]).slice(0,5);
    const titles = p.contentClusterTitles || [];
    const bg = isDark ? "#000" : "#fff";
    const text = isDark ? "#fff" : "#111";
    const cardImgs = damImages?.length >= 3 ? damImages : [];
    const navBg = isDark ? "#111" : pc;
    const heroGrad = isDark
      ? `linear-gradient(135deg, #111 0%, #1a1a1a 100%)`
      : `linear-gradient(135deg, ${pc} 0%, ${sc} 100%)`;
    const accent = isDark ? (sc !== "#7C3AED" ? sc : "#f5a623") : pc;
    const btnStyle = isDark
      ? `background:#fff;color:#000;border:none;padding:16px 40px;font-size:14px;font-weight:700;cursor:pointer;letter-spacing:.1em;text-transform:uppercase;`
      : `background:#fff;color:${pc};border:none;border-radius:8px;padding:16px 36px;font-size:15px;font-weight:800;cursor:pointer;`;
    const cardBg = isDark ? "#111" : "#f9fafb";
    const cardBorder = isDark ? "#222" : "#e5e7eb";
    const cardText = isDark ? "#fff" : "#111";
    const cardSub = isDark ? "#888" : "#6b7280";

    // Generate CSS-only hero pattern (no images needed)
    const heroPattern = isDark
      ? `background: #000; background-image: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.03) 0%, transparent 60%), radial-gradient(circle at 80% 20%, ${accent}22 0%, transparent 50%);`
      : `background: ${heroGrad};`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${ca} | ${co}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;background:${bg};color:${text};}
nav{background:${navBg};position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:${isDark?'60px':'64px'};${isDark?'border-bottom:1px solid #222;':''}}
.logo{font-size:${isDark?'18':'20'}px;font-weight:900;color:#fff;letter-spacing:${isDark?'.05em':'-.3px'};text-transform:${isDark?'uppercase':'none'};}
.nav-links{display:flex;align-items:center;gap:${isDark?'32':'28'}px;}
.nav-link{font-size:13px;color:rgba(255,255,255,.75);cursor:pointer;font-weight:500;text-decoration:none;}
.nav-link.active{color:#fff;font-weight:700;${isDark?'text-decoration:underline;text-underline-offset:4px;':'border-bottom:2px solid rgba(255,255,255,.7);padding-bottom:2px;'}}
.nav-cta{${isDark?`background:#fff;color:#000;padding:10px 24px;font-size:13px;font-weight:700;cursor:pointer;letter-spacing:.05em;text-transform:uppercase;border:none;`:`background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.4);color:#fff;border-radius:8px;padding:9px 20px;font-size:13px;font-weight:700;cursor:pointer;`}}
.hero{${heroPattern}min-height:${isDark?'90vh':'560px'};display:flex;align-items:${isDark?'flex-end':'center'};padding:${isDark?'0 64px 80px':'80px 48px'};position:relative;overflow:hidden;}
.hero-eyebrow{font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:${accent};margin-bottom:16px;}
.hero h1{font-size:${isDark?'80':'56'}px;font-weight:900;color:#fff;line-height:1.0;letter-spacing:${isDark?'-.02em':'-.5px'};margin-bottom:${isDark?'32':'20'}px;text-transform:${isDark?'uppercase':'none'};max-width:700px;}
.hero p{font-size:${isDark?'16':'19'}px;color:rgba(255,255,255,.8);line-height:1.6;margin-bottom:36px;max-width:540px;}
.hero-btns{display:flex;gap:14px;flex-wrap:wrap;}
.btn-primary{${btnStyle}}
.btn-ghost{background:transparent;color:#fff;border:${isDark?'2px solid #fff':'1px solid rgba(255,255,255,.6)'};${isDark?'':'border-radius:8px;'}padding:${isDark?'14px 40px':'15px 36px'};font-size:${isDark?'13':'15'}px;font-weight:700;cursor:pointer;letter-spacing:${isDark?'.1em':'0'};text-transform:${isDark?'uppercase':'none'};}
/* Decorative geometric shapes for Nike-style visual interest */
.hero-shape{position:absolute;${isDark?`right:-100px;top:-100px;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,${accent}15 0%,transparent 70%);`:`right:0;top:0;bottom:0;width:40%;background:rgba(255,255,255,.08);clip-path:polygon(20% 0%,100% 0%,100% 100%,0% 100%);`}}
.section{padding:80px 48px;max-width:1200px;margin:0 auto;}
.section-label{font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:${accent};margin-bottom:16px;}
.section h2{font-size:${isDark?'48':'36'}px;font-weight:900;color:${text};margin-bottom:${isDark?'48':'40'}px;text-transform:${isDark?'uppercase':'none'};letter-spacing:${isDark?'-.02em':'-.01em'};}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:${isDark?'2px':'24px'};}
.card{background:${cardBg};${isDark?'':'border:1px solid '+cardBorder+';border-radius:12px;'}overflow:hidden;${isDark?'border-top:2px solid '+accent+';':''}}
.card-num{font-size:11px;font-weight:700;color:${accent};letter-spacing:.1em;text-transform:uppercase;margin-bottom:12px;}
.card h3{font-size:${isDark?'18':'17'}px;font-weight:800;color:${cardText};margin-bottom:10px;text-transform:${isDark?'uppercase':'none'};letter-spacing:${isDark?'.05em':'0'};}
.card p{font-size:13px;color:${cardSub};line-height:1.6;}
.divider{height:${isDark?'80px':'0'};background:${isDark?'#111':'transparent'};display:flex;align-items:center;padding:${isDark?'0 48px':'0'};${isDark?'border-top:1px solid #1a1a1a;border-bottom:1px solid #1a1a1a;':''}}
.stats-section{background:${isDark?'#111':'#f9fafb'};${isDark?'border-top:1px solid #1a1a1a;border-bottom:1px solid #1a1a1a;':''}padding:${isDark?'64px':'60px'} 48px;}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;max-width:900px;margin:0 auto;text-align:center;}
.stat-num{font-size:${isDark?'52':'40'}px;font-weight:900;color:${isDark?'#fff':pc};letter-spacing:-.02em;text-transform:${isDark?'uppercase':'none'};}
.stat-label{font-size:13px;color:${isDark?'#666':cardSub};margin-top:8px;font-weight:${isDark?'700':'500'};letter-spacing:${isDark?'.05em':'0'};text-transform:${isDark?'uppercase':'none'};}
.cta-section{background:${isDark?'#111':'linear-gradient(135deg,'+pc+','+sc+')'};${isDark?'border-top:1px solid #222;':''}padding:${isDark?'100px':'80px'} 48px;text-align:center;}
.cta-section h2{font-size:${isDark?'56':'40'}px;font-weight:900;color:#fff;margin-bottom:16px;text-transform:${isDark?'uppercase':'none'};}
.cta-section p{font-size:17px;color:rgba(255,255,255,.8);margin-bottom:40px;}
.cta-form{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}
.cta-input{background:${isDark?'#1a1a1a':'#fff'};border:${isDark?'1px solid #333':'none'};border-radius:${isDark?'2':'8'}px;padding:16px 24px;font-size:14px;width:300px;outline:none;color:${isDark?'#fff':'#111'};}
.cta-input::placeholder{color:#666;}
.cta-btn{${isDark?`background:#fff;color:#000;border:none;padding:16px 36px;font-size:14px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;`:`background:#fff;color:${pc};border:none;border-radius:8px;padding:16px 32px;font-size:14px;font-weight:800;cursor:pointer;`}}
footer{background:${isDark?'#111':'#111827'};color:#fff;padding:48px;${isDark?'border-top:1px solid #1a1a1a;':''}}
.footer-top{display:grid;grid-template-columns:2fr 1fr 1fr;gap:40px;margin-bottom:40px;}
.footer-brand{font-size:18px;font-weight:900;margin-bottom:12px;text-transform:${isDark?'uppercase':'none'};}
.footer-desc{font-size:13px;color:#666;line-height:1.6;}
.footer-col h4{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#666;margin-bottom:14px;}
.footer-link{display:block;font-size:13px;color:#999;margin-bottom:8px;cursor:pointer;}
.footer-bottom{border-top:1px solid #222;padding-top:20px;display:flex;justify-content:space-between;font-size:12px;color:#666;}
</style>
</head>
<body>
<nav>
  <div class="logo">${co}</div>
  <div class="nav-links">
    ${navs.map(n=>`<span class="nav-link${n===ca?' active':''}">${n}</span>`).join('')}
    <span class="nav-link active">${ca}</span>
  </div>
  <button class="nav-cta">${isDark?'SHOP NOW':'Get Started'}</button>
</nav>

<div class="hero">
  <div class="hero-shape"></div>
  <div style="position:relative;z-index:1;">
    <div class="hero-eyebrow">${ind} · ${co}</div>
    <h1>${ca}</h1>
    <p>${cd}</p>
    <div class="hero-btns">
      <button class="btn-primary">${isDark?'SHOP NOW →':'Get Started'}</button>
      <button class="btn-ghost">${isDark?'EXPLORE':'Learn More'}</button>
    </div>
  </div>
</div>

<div style="background:${isDark?'#000':'#fff'};padding:80px 48px;">
  <div style="max-width:1200px;margin:0 auto;">
    <div class="section-label">Featured ${isDark?'Collection':'Solutions'}</div>
    <h2>${isDark?'BUILT FOR PERFORMANCE':'Core Products & Services'}</h2>
    <div class="cards">
      ${prods.slice(0,3).map((prod,i)=>{const img=cardImgs[i];return`
      <div class="card" style="padding:0;overflow:hidden;">
        ${img?`<img src="${img}" alt="${prod}" style="display:block;width:100%;height:200px;object-fit:cover;">`:`<div style="height:120px;background:${isDark?'linear-gradient(135deg,#222,#333)':`linear-gradient(135deg,${pc}22,${sc}22)`};display:flex;align-items:center;justify-content:center;"><span style="font-size:22px;font-weight:800;color:${isDark?'rgba(255,255,255,0.25)':`${pc}55`}">${(prod||'?')[0]}</span></div>`}
        <div style="padding:20px 24px;">
          <div style="font-size:11px;font-weight:700;color:${accent};letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;">0${i+1}</div>
          <h3 style="font-size:${isDark?'16':'17'}px;font-weight:800;color:${cardText};margin-bottom:8px;text-transform:${isDark?'uppercase':'none'};letter-spacing:${isDark?'.05em':'0'}">${prod}</h3>
          <p style="font-size:13px;color:${cardSub};line-height:1.6;">${isDark?`Engineered for athletes. Built for the future of ${ind}.`:`Purpose-built for modern ${ind} teams — delivering measurable impact from day one.`}</p>
          <div style="margin-top:16px;font-size:12px;font-weight:700;color:${accent};letter-spacing:.08em;cursor:pointer;text-transform:${isDark?'uppercase':'none'}">${isDark?'SHOP NOW →':'Explore →'}</div>
        </div>
      </div>`}).join('')}
    </div>
  </div>
</div>

<div class="stats-section">
  <div style="text-align:center;margin-bottom:48px;">
    <div class="section-label">By the numbers</div>
    <h2 style="font-size:${isDark?'40':'32'}px;font-weight:900;color:${text};text-transform:${isDark?'uppercase':'none'};">${isDark?'THE IMPACT':'Trusted by Leaders'}</h2>
  </div>
  <div class="stats">
    <div><div class="stat-num">500+</div><div class="stat-label">Global ${isDark?'Athletes':'Clients'}</div></div>
    <div><div class="stat-num">98%</div><div class="stat-label">${isDark?'Performance':'Satisfaction'}</div></div>
    <div><div class="stat-num">3.2×</div><div class="stat-label">Faster Results</div></div>
    <div><div class="stat-num">24/7</div><div class="stat-label">Support</div></div>
  </div>
</div>

${titles.length ? `
<div style="background:${isDark?'#000':'#f8fafc'};padding:80px 48px;">
  <div style="max-width:900px;margin:0 auto;">
    <div class="section-label">Editorial</div>
    <h2>${isDark?'STORIES':'Latest Insights'}</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:${isDark?'2px':'16px'};">
      ${titles.map((t,i)=>`
      <div style="background:${isDark?'#111':'#fff'};${isDark?'border-top:1px solid #1a1a1a;':'border:1px solid #e5e7eb;border-radius:10px;'}padding:24px;cursor:pointer;">
        <div style="font-size:10px;font-weight:700;color:${accent};letter-spacing:.12em;text-transform:uppercase;margin-bottom:10px;">${['Article','Guide','Report','Story'][i%4]}</div>
        <div style="font-size:${isDark?'15':'14'}px;font-weight:700;color:${text};line-height:1.4;text-transform:${isDark?'uppercase':'none'};letter-spacing:${isDark?'.02em':'0'}">${t}</div>
      </div>`).join('')}
    </div>
  </div>
</div>` : ''}

<div class="cta-section">
  <h2>${isDark?`JOIN THE ${ca.toUpperCase()}`:`Ready to experience ${co}?`}</h2>
  <p>${isDark?`Be part of something bigger. Register now.`:cd}</p>
  <div class="cta-form">
    <input class="cta-input" type="email" placeholder="Enter your email"/>
    <button class="cta-btn">${isDark?'JOIN NOW →':'Get Access →'}</button>
  </div>
</div>

<footer>
  <div class="footer-top">
    <div>
      <div class="footer-brand">${co}</div>
      <div class="footer-desc">${p.businessDescription || `The leading platform for ${ind}.`}</div>
    </div>
    <div>
      <h4>${isDark?'Shop':'Product'}</h4>
      ${prods.map(pr=>`<span class="footer-link">${pr}</span>`).join('')}
    </div>
    <div>
      <h4>Company</h4>
      <span class="footer-link">About</span>
      <span class="footer-link">Careers</span>
      <span class="footer-link">Press</span>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© 2026 ${co}. All rights reserved.</span>
    <span>${ca} · ${ind}</span>
  </div>
</footer>
</body>
</html>`;
  };

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      <Sidebar active="sites" p={p} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#f9fafb", overflow: "hidden" }}>
        <div style={{ height: 48, background: "#fff", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", padding: "0 16px", gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 16 }}>🔒</span>
          <div style={{ flex: 1, background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 20, padding: "4px 14px", fontSize: 12, color: "#374151", maxWidth: 440 }}>{p.url || "https://yoursite.acquia.site"}</div>
          <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
            <button onClick={() => setView("campaign")} style={{ fontSize: 11, fontWeight: 600, borderRadius: 6, padding: "5px 12px", border: "none", cursor: "pointer", background: view === "campaign" ? pc : "#f3f4f6", color: view === "campaign" ? cc(pc) : "#374151" }}>
              ✓ {ip("{ca} Page", p)}
            </button>
            <button onClick={() => setView("original")} style={{ fontSize: 11, fontWeight: 600, borderRadius: 6, padding: "5px 12px", cursor: "pointer", background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" }}>
              Original Site
            </button>
          </div>
          <div style={{ background: "#ECFDF5", color: "#059669", border: "1px solid #D1FAE5", borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
            ✓ {ip("{ca} Page Added", p)}
          </div>
        </div>
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          {view === "campaign" ? (
            <iframe
              srcDoc={campHtml || buildCampaignPage()}
              sandbox="allow-scripts allow-same-origin"
              style={{ width: "100%", height: "100%", border: "none" }}
              title="campaign page"
            />
          ) : (
            <iframe src={p.url} style={{ width: "100%", height: "100%", border: "none" }} title="original site" />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Hotspot Definitions ───────────────────────────────────────────────────────
const HOTSPOTS = [
  { x: 50, y: 88, title: "This is {who}'s story", body: "{who} is the {role} at {co}. She needs to build and launch a site — without writing a single line of code." },
  { x: 28, y: 58, title: "Meet Jacob — your AI Website Builder", body: "Jacob is {co}'s dedicated website builder agent — with access to brand guidelines, Slack, and Acquia Source. {who} selects Jacob to begin." },
  { x: 84, y: 90, title: "{who} describes her goal", body: "No tickets. No briefs. {who} types her goal in plain language — build the {co} site from Figma, WCAG AA, optimised for AI answer engines." },
  { x: 78, y: 85, title: "Jacob reviews the {co} Figma design", body: "Before making any plan, Jacob analyses the {co} Figma file — mapping layout, brand tokens, components, and navigation. He shares a live preview before proceeding." },
  { x: 55, y: 48, title: "A reviewable plan — before any action", body: "Jacob returns a step-by-step plan for {co}'s site. {who} approves it — including the WCAG audit — before Jacob takes any action." },
  { x: 52, y: 62, title: "Jacob executes — step by step", body: "Jacob works through the plan transparently. {who} sees every step in real time. No engineering ticket. No waiting." },
  { x: 13, y: 38, title: "{co} site is live", body: "The {co} site now appears in Acquia Source. Built from Figma, WCAG AA passed, AEO-optimised. Zero code written by {who}." },
  { x: 82, y: 16, title: "WCAG AA — Passed ✓", body: "{co}'s site is accessible and AEO-optimised — ready to be cited by ChatGPT, Perplexity, and every AI answer engine." },
  { x: 50, y: 52, title: "Site live — zero lines of code", body: "{co} is live. WCAG AA compliant, AEO-structured — built from a Figma design without a single line of code written by {who}." },
  { x: 68, y: 22, title: "Urgent: {ca} launch moved up", body: (p) => (p?.urgentCampaignTrigger || "") + ". {who} types the next request without leaving the chat." },
  { x: 52, y: 45, title: "Plan: Add {ca} to {co}'s site", body: "Jacob spots the existing {co} site and proposes a focused 4-step plan — {ind}-specific assets, campaign page, AEO content cluster, navigation update." },
  { x: 19, y: 48, title: "Brand-aligned {ind} assets surfaced", body: "Jacob searches the {co} DAM and surfaces 4 on-brand {ind} assets validated against {co} brand guidelines. {who} confirms the selection." },
  { x: 50, y: 55, title: "AEO-ready {ind} content cluster", body: "The Writing Assistant creates a content cluster for {ca} — articles structured so AI answer engines surface {co} when {ind} customers search for solutions." },
  { x: 35, y: 6, title: "{ca} is live 🎉", body: "{co}'s site now includes the {ca} page — on-brand, {ind}-specific, AEO-ready. {who} went from Figma to live without writing a single line of code.", isLast: true },
];

// ── Demo Shell ────────────────────────────────────────────────────────────────
function DemoShell({ p, campHtml, damImages, selectedScreens, onRestart }) {
  // screenList = ordered list of screen indices to show. null means all 14.
  const screenList = selectedScreens || [0,1,2,3,4,5,6,7,8,9,10,11,12,13];
  const [idx, setIdx] = useState(0); // index into screenList
  const [done, setDone] = useState(false);
  const [key, setKey] = useState(0);

  const cur = screenList[idx]; // actual screen number (0-13)
  const total = screenList.length;

  const next = useCallback(() => {
    if (idx >= screenList.length - 1) { setDone(true); return; }
    setTimeout(() => { setIdx(i => i + 1); setKey(k => k + 1); }, 80);
  }, [idx, screenList]);

  const prev = useCallback(() => {
    if (idx <= 0) return;
    setIdx(i => i - 1); setKey(k => k + 1);
  }, [idx]);

  useEffect(() => {
    const handler = e => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [idx, next, prev]);

  // Build a label showing which module this screen belongs to
  const moduleTag = (() => {
    if (!selectedScreens) return null;
    const mod = MODULES.find(m => m.screens.includes(cur));
    return mod ? { label: mod.title, color: mod.color, bg: mod.bg, emoji: mod.emoji } : null;
  })();

  if (done) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#0076BD,#7C3AED)", color: "#fff", gap: 20, textAlign: "center", padding: 24 }}>
        <div style={{ fontSize: 60 }}>🎉</div>
        <div style={{ fontSize: 28, fontWeight: 800 }}>{ip("{co} is live", p)}</div>
        <div style={{ fontSize: 15, opacity: .85, maxWidth: 520, lineHeight: 1.7 }}>
          {ip("{who} launched the {co} site and the {ca} campaign page — without writing a single line of code.", p)}
        </div>
        {selectedScreens && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 480 }}>
            {MODULES.filter(m => selectedScreens.some(s => m.screens.includes(s))).map(m => (
              <span key={m.id} style={{ background: "rgba(255,255,255,.2)", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 600 }}>{m.emoji} {m.title} ✓</span>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
          <button onClick={onRestart} style={{ background: "#fff", color: "#2563EB", border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>← Try with Another URL</button>
          <button onClick={() => { setDone(false); setIdx(0); setKey(k => k + 1); }} style={{ background: "rgba(255,255,255,.2)", color: "#fff", border: "1px solid rgba(255,255,255,.4)", borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>↺ Replay Demo</button>
        </div>
        <div style={{ fontSize: 12, opacity: .6, marginTop: 8 }}>💡 Press ← → to navigate at any time</div>
      </div>
    );
  }

  const hs = { ...HOTSPOTS[cur] };
  if (typeof hs.body === "function") hs.body = hs.body(p);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", fontFamily: "'DM Sans',sans-serif" }}>
      {/* Progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, background: "#e5e7eb", zIndex: 200 }}>
        <div style={{ height: "100%", width: `${(idx + 1) / total * 100}%`, background: "linear-gradient(90deg,#2563EB,#7C3AED)", transition: "width .3s" }} />
      </div>
      <BrandBar p={p} cur={cur} total={total} step={idx + 1} />

      {/* Module highlight tag */}
      {moduleTag && (
        <div style={{ position: "fixed", top: 36, right: 16, zIndex: 200, background: moduleTag.bg, border: `1px solid ${moduleTag.color}44`, borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700, color: moduleTag.color, boxShadow: "0 2px 8px rgba(0,0,0,.1)" }}>
          {moduleTag.emoji} {moduleTag.label}
        </div>
      )}

      <div key={key} className="sc" style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative", paddingTop: 3 }}>
        {cur === 0 && <Screen1 p={p} />}
        {cur === 1 && <Screen2 p={p} />}
        {cur === 2 && <Screen3 p={p} />}
        {cur === 3 && <Screen4 p={p} />}
        {cur === 4 && <Screen5 p={p} />}
        {cur === 5 && <Screen6 p={p} />}
        {cur === 6 && <Screen7 p={p} />}
        {cur === 7 && <Screen8 p={p} />}
        {cur === 8 && <Screen9 p={p} />}
        {cur === 9 && <Screen10 p={p} />}
        {cur === 10 && <Screen11 p={p} />}
        {cur === 11 && <Screen12 p={p} damImages={damImages} />}
        {cur === 12 && <Screen13 p={p} />}
        {cur === 13 && <Screen14 p={p} campHtml={campHtml} damImages={damImages} />}
        <HotspotOverlay hs={hs} p={p} onNext={next} onBack={prev} cur={idx} total={total} />
      </div>
      <div style={{ position: "fixed", bottom: 16, right: 16, display: "flex", gap: 8, alignItems: "center", zIndex: 200 }}>
        {idx > 0 && (
          <button onClick={prev} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 20, padding: "4px 10px", fontSize: 11, color: "#6b7280", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.1)" }}>← Prev</button>
        )}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 20, padding: "4px 12px", fontSize: 11, color: "#6b7280", boxShadow: "0 2px 8px rgba(0,0,0,.1)" }}>
          {idx + 1} / {total}
        </div>
      </div>
    </div>
  );
}

// ── Welcome Screen ────────────────────────────────────────────────────────────
const SAMPLE_COMPANIES = [
  { label: "Nike", url: "https://www.nike.com", color: "#111" },
  { label: "Salesforce", url: "https://www.salesforce.com", color: "#00A1E0" },
  { label: "HubSpot", url: "https://www.hubspot.com", color: "#FF7A59" },
  { label: "Shopify", url: "https://www.shopify.com", color: "#96BF48" },
];

function WelcomeScreen({ onStart }) {
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");

  const handleAI = (overrideUrl) => {
    let u = (overrideUrl || url).trim();
    if (!u) { setUrlError("Please enter a URL."); return; }
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    try { new URL(u); } catch { setUrlError("Please enter a valid URL."); return; }
    setUrlError("");
    onStart({ type: "ai", url: u });
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0076BD 0%,#2563EB 50%,#7C3AED 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 540, width: "100%", background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,.3)" }}>
        <div style={{ background: "linear-gradient(135deg,#0076BD,#2563EB)", padding: "22px 26px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>⚡</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>Acquia AI Interactive Demo</div>
            <div style={{ color: "rgba(255,255,255,.75)", fontSize: 12, marginTop: 2 }}>Personalized to your prospect's brand in seconds</div>
          </div>
        </div>
        <div style={{ padding: "24px 26px" }}>
          <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.65, marginBottom: 16 }}>
            Enter your prospect's website URL. The AI extracts their brand, generates a realistic persona, and personalizes every screen.
          </p>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>Quick start — click a sample company</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {SAMPLE_COMPANIES.map(sc => (
                <button key={sc.label} onClick={() => { setUrl(sc.url); setTimeout(() => handleAI(sc.url), 50); }} style={{ background: `${sc.color}10`, border: `1px solid ${sc.color}30`, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, color: sc.color || "#374151", cursor: "pointer" }}>
                  {sc.label}
                </button>
              ))}
            </div>
          </div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Prospect's Website URL</label>
          <input
            value={url} onChange={e => { setUrl(e.target.value); setUrlError(""); }}
            onKeyDown={e => e.key === "Enter" && handleAI()}
            placeholder="https://prospect.com"
            style={{ width: "100%", border: `1px solid ${urlError ? "#EF4444" : "#e5e7eb"}`, borderRadius: 8, padding: "11px 14px", fontSize: 13, outline: "none", marginBottom: urlError ? 4 : 14 }}
          />
          {urlError && <div style={{ color: "#EF4444", fontSize: 11, marginBottom: 10 }}>{urlError}</div>}
          <button onClick={() => handleAI()} style={{ width: "100%", background: "linear-gradient(135deg,#0076BD,#2563EB)", color: "#fff", border: "none", borderRadius: 8, padding: "13px 0", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Analyze & Start Demo →</button>
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: "#9ca3af", padding: "0 26px 18px" }}>Prospect data is not stored or shared</div>
      </div>
    </div>
  );
}

// ── Analyzing Screen ──────────────────────────────────────────────────────────
function AnalyzingScreen({ url }) {
  const msgs = [
    `Searching ${url || "site"}...`,
    "Extracting brand identity...",
    "Building persona...",
    "Generating campaign content...",
    "Personalizing all 14 screens..."
  ];
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setMsgIdx(i => Math.min(i + 1, msgs.length - 1)), 1200);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0076BD 0%,#2563EB 50%,#7C3AED 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 24, color: "#fff", padding: 24 }}>
      <div style={{ width: 56, height: 56, border: "4px solid rgba(255,255,255,.25)", borderTop: "4px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{msgs[msgIdx]}</div>
        <div style={{ fontSize: 12, opacity: .65, maxWidth: 320 }}>{url}</div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {msgs.map((_, i) => (
          <div key={i} style={{ width: i <= msgIdx ? 16 : 8, height: 8, borderRadius: 4, background: i <= msgIdx ? "#fff" : "rgba(255,255,255,.3)", transition: "all .3s" }} />
        ))}
      </div>
      <div style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 12, padding: "14px 20px", maxWidth: 360, textAlign: "center" }}>
        <div style={{ fontSize: 12, opacity: .9, lineHeight: 1.6 }}>
          ✨ AI is analyzing the company's website, extracting brand colors, creating a realistic persona, and generating industry-specific content…
        </div>
      </div>
    </div>
  );
}

// ── Module Definitions (maps to screen indices) ───────────────────────────────
const MODULES = [
  { id: "wcag",      icon: "♿", emoji: "🛡️", title: "WCAG Compliance",        color: "#059669", bg: "#ECFDF5", border: "#D1FAE5", screens: [7, 8],     desc: "See Jacob automatically audit and ensure WCAG 2.1 AA accessibility across every page before publishing." },
  { id: "brand",     icon: "🎨", emoji: "🎨", title: "Brand Consistency",       color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE", screens: [3, 4, 6],  desc: "Watch Jacob extract brand tokens from Figma and apply them across the entire site — zero manual work." },
  { id: "aeo",       icon: "🤖", emoji: "🤖", title: "AEO-Optimized Content",   color: "#2563EB", bg: "#EFF6FF", border: "#DBEAFE", screens: [12, 13],   desc: "See the Writing Assistant build content clusters cited by ChatGPT, Perplexity, and AI search engines." },
  { id: "campaign",  icon: "🚀", emoji: "🚀", title: "Campaign Builder",         color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", screens: [9, 10, 13], desc: "Watch Jacob build a fully personalised campaign page for {co} in minutes — no code, no dev tickets." },
  { id: "dam",       icon: "🖼️", emoji: "🖼️", title: "DAM & Asset Management", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", screens: [11],       desc: "Explore how Jacob surfaces brand-aligned {ind} assets from the {co} DAM — validated against brand guidelines." },
];

// ── Launchpad Screen ──────────────────────────────────────────────────────────
function Launchpad({ p, onStart }) {
  const [sel, setSel] = useState(new Set());
  const pc = p?.primaryColor || "#0076BD";
  const sc = p?.secondaryColor || "#7C3AED";

  const toggle = id => setSel(s => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const selModules = MODULES.filter(m => sel.has(m.id));
  const allScreens = sel.size === 0
    ? null // show all screens when nothing selected
    : [...new Set([0, 1, 2, 3, 4, 5, 6, ...selModules.flatMap(m => m.screens), 13])].sort((a, b) => a - b);

  const faviconUrl = p?.url ? `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(p.url)}` : null;

  return (
    <div style={{ width: "100vw", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${pc} 0%, #2563EB 50%, ${sc} 100%)`, fontFamily: "'DM Sans',sans-serif", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 20, maxWidth: 700, width: "100%", boxShadow: "0 32px 80px rgba(0,0,0,0.28)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${pc}, ${sc})`, padding: "28px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>⚡</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                {faviconUrl && <img src={faviconUrl} width={20} height={20} style={{ borderRadius: 4, background: "#fff", padding: 1 }} alt="" onError={e => e.target.style.display = "none"} />}
                {p?.companyName ? `${p.companyName} — ` : ""}Acquia AI Demo
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", marginTop: 2 }}>
                {p?.personaName && <span style={{ fontWeight: 600 }}>{p.personaName}</span>}
                {p?.personaTitle && <span style={{ opacity: 0.8 }}> · {p.personaTitle}</span>}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {p?.industry && <span style={{ background: "rgba(255,255,255,0.18)", borderRadius: 20, padding: "4px 14px", fontSize: 12, color: "#fff", fontWeight: 500 }}>{p.industry}</span>}
            {p?.campaignName && <span style={{ background: "rgba(255,255,255,0.12)", borderRadius: 20, padding: "4px 14px", fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>🎯 {p.campaignName}</span>}
          </div>
        </div>

        <div style={{ padding: "28px 32px" }}>
          <div style={{ marginBottom: 22 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#111827", marginBottom: 6 }}>What would you like to see?</h2>
            <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.65 }}>
              Select the capabilities that matter most to <strong>{p?.companyName || "your prospect"}</strong>. 
              The demo will focus on those areas as {p?.personaName || "your persona"} builds the site with Jacob.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            {MODULES.map(mod => {
              const on = sel.has(mod.id);
              const desc = mod.desc
                .replace("{co}", p?.companyName || "the company")
                .replace("{ind}", p?.industry || "industry");
              return (
                <div key={mod.id} onClick={() => toggle(mod.id)}
                  style={{ border: on ? `2px solid ${mod.color}` : "1px solid #e5e7eb", borderRadius: 14, padding: "16px", background: on ? mod.bg : "#fff", cursor: "pointer", position: "relative", boxShadow: on ? `0 0 0 3px ${mod.color}18` : "none", transition: "all 0.15s" }}>
                  {on && (
                    <div style={{ position: "absolute", top: 12, right: 12, width: 22, height: 22, borderRadius: "50%", background: mod.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>✓</div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ width: 36, height: 36, borderRadius: 9, background: on ? mod.border : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>{mod.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: on ? mod.color : "#111827" }}>{mod.title}</span>
                  </div>
                  <div style={{ fontSize: 12, color: on ? mod.color : "#6b7280", lineHeight: 1.55, opacity: on ? 0.9 : 0.8 }}>{desc}</div>
                </div>
              );
            })}
          </div>

          {/* Preview of what's included */}
          {sel.size > 0 && (
            <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>
                ✨ Your personalised demo will cover {allScreens?.length || 14} screens:
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {selModules.map(m => (
                  <span key={m.id} style={{ background: m.bg, border: `1px solid ${m.border}`, color: m.color, borderRadius: 20, padding: "3px 11px", fontSize: 11, fontWeight: 600 }}>
                    {m.emoji} {m.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => onStart(sel.size > 0 ? allScreens : null)}
            style={{ width: "100%", padding: "15px", borderRadius: 10, border: "none", background: `linear-gradient(90deg, ${pc}, ${sc})`, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 20px ${pc}44`, transition: "opacity 0.15s" }}>
            {sel.size > 0 ? `Start Demo — ${sel.size} area${sel.size !== 1 ? "s" : ""} selected →` : "Start Full Demo →"}
          </button>
          <div style={{ textAlign: "center", fontSize: 11, color: "#9ca3af", marginTop: 12 }}>
            {sel.size === 0 ? "No selection = full 14-screen demo" : `Skipping ${14 - (allScreens?.length || 14)} screens not relevant to your selection`}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Password Gate ─────────────────────────────────────────────────────────────
function PasswordGate({ onAuth }) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState(false);

  const attempt = () => {
    if (val === (import.meta.env.VITE_DEMO_PASSWORD || "acquia2026")) {
      sessionStorage.setItem("demo_auth", "1");
      onAuth();
    } else {
      setErr(true);
      setVal("");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 16, width: 480, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
        <div style={{ padding: "40px 40px 28px", textAlign: "center", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#0BB5D6,#0076BD)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22, fontWeight: 800 }}>⚡</div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#111827", marginBottom: 8 }}>Authentication Required</div>
          <div style={{ fontSize: 14, color: "#6b7280" }}>This deployment is protected.</div>
        </div>
        <div style={{ padding: "28px 40px 36px" }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Visitor Password</label>
          <input
            type="password"
            value={val}
            autoFocus
            onChange={e => { setVal(e.target.value); setErr(false); }}
            onKeyDown={e => e.key === "Enter" && attempt()}
            style={{ width: "100%", border: `1px solid ${err ? "#EF4444" : "#e5e7eb"}`, borderRadius: 8, padding: "14px 16px", fontSize: 15, outline: "none", marginBottom: err ? 6 : 16, color: "#111827", background: err ? "#FEF2F2" : "#fff" }}
            placeholder=""
          />
          {err && <div style={{ color: "#EF4444", fontSize: 12, marginBottom: 12 }}>Incorrect password. Please try again.</div>}
          <button
            onClick={attempt}
            style={{ width: "100%", background: "#111827", color: "#fff", border: "none", borderRadius: 8, padding: "15px 0", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("demo_auth") === "1");
  const [phase, setPhase] = useState("welcome");
  const [prospect, setProspect] = useState(null);
  const [campHtml, setCampHtml] = useState(null);
  const [damImages, setDamImages] = useState([]);
  const [analyzingUrl, setAnalyzingUrl] = useState("");
  const [selectedScreens, setSelectedScreens] = useState(null); // null = all screens

  const handleStart = async ({ url }) => {
    setAnalyzingUrl(url); setPhase("analyzing");
    let p;
    try {
      p = await analyzeProspect(url);
    } catch (e) {
      console.error("Analysis failed:", e);
      p = fallbackProspect(url);
    }

    // Show hardcoded industry images immediately — sync, reliable, no waiting.
    const damImgs = buildKeywordImages(p);
    setProspect(p);
    setDamImages(damImgs);
    setPhase("launchpad");

    // Fetch fresh keyword images ONCE — shared with both DAM and campaign HTML cards.
    // Avoids double Unsplash API calls and ensures both screens show the same relevant images.
    fetchKeywordImages(p.assetKeywords, p.industry, 8)
      .catch(() => damImgs)
      .then(freshImgs => {
        const cardImgs = freshImgs?.length >= 4 ? freshImgs : damImgs;
        setDamImages(cardImgs);
        // Campaign HTML pipeline — hero uses real brand images, cards use shared keyword images.
        return buildDynamicImages(p)
          .catch(() => cardImgs)
          .then(dynImgs => genCampaignHTML(p, dynImgs?.length ? dynImgs : cardImgs, cardImgs))
          .then(html => { if (html) setCampHtml(injectClusterSection(html, p)); });
      })
      .catch(() => {
        genCampaignHTML(p, damImgs, damImgs).then(html => {
          if (html) setCampHtml(injectClusterSection(html, p));
        }).catch(() => {});
      });
  };

  const handleRestart = () => {
    setPhase("welcome"); setProspect(null); setCampHtml(null); setDamImages([]); setAnalyzingUrl(""); setSelectedScreens(null);
  };

  if (!authed) return <><style>{STYLE}</style><PasswordGate onAuth={() => setAuthed(true)} /></>;

  return (
    <>
      <style>{STYLE}</style>
      {phase === "welcome" && <WelcomeScreen onStart={handleStart} />}
      {phase === "analyzing" && <AnalyzingScreen url={analyzingUrl} />}
      {phase === "launchpad" && prospect && (
        <Launchpad p={prospect} onStart={screens => { setSelectedScreens(screens); setPhase("demo"); }} />
      )}
      {phase === "demo" && prospect && (
        <DemoShell p={prospect} campHtml={campHtml} damImages={damImages} selectedScreens={selectedScreens} onRestart={handleRestart} />
      )}
    </>
  );
}