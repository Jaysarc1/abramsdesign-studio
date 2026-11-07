/* ===========================================================================
   VELA — the aircraft on the desk.

   price      shown on the card and in the hero ("" reads "Price on request")
   status     "available" (green dot) or "contract" (amber dot, under contract)
   note       the paragraph that describes the aircraft
   =========================================================================== */
(function(){
  var B = /\/(g550|f900|cl350|cj4|cl605)\//.test(location.pathname) ? '../' : '';
  window.VELA_BASE = B;

  function U(id, w){
    return 'https://images.unsplash.com/' + id + '?w=' + (w || 1600) + '&q=80&auto=format&fit=crop';
  }
  window.VELA_IMG = U;

  /* the drawings for each feature, keyed by name */
  window.VELA_FEATURES = [
    ["wifi",   "Ka-band Wi-Fi"],
    ["galley", "Full galley"],
    ["lav",    "Enclosed lav"],
    ["sleep",  "Sleeps 6"],
    ["bag",    "Baggage, in reach"],
    ["engine", "Engines on program"]
  ];

  /* line drawings, one stroke weight, drawn on a 24 grid */
  function I(d, w){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (w || 1.4) + '" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>'; }
  window.VELA_ICONS = {
    wifi:   I('<path d="M2.6 8.9a14 14 0 0 1 18.8 0"/><path d="M5.8 12.4a9.4 9.4 0 0 1 12.4 0"/><path d="M9 15.9a4.8 4.8 0 0 1 6 0"/><circle cx="12" cy="19.4" r="1.1" fill="currentColor" stroke="none"/>'),
    galley: I('<path d="M5 10h11v4.5a4.5 4.5 0 0 1-4.5 4.5h-2A4.5 4.5 0 0 1 5 14.5z"/><path d="M16 11.4h1.5a2.2 2.2 0 0 1 0 4.4H16"/><path d="M8.6 7.2c0-1.2 1-1.4 1-2.6M12 7.2c0-1.2 1-1.4 1-2.6"/><path d="M3.8 21.2h14.4"/>'),
    lav:    I('<rect x="6" y="2.8" width="12" height="18.4" rx="1.6"/><circle cx="15" cy="12.2" r=".85" fill="currentColor" stroke="none"/><path d="M3.4 21.2h17.2"/>'),
    sleep:  I('<path d="M2.8 18h18.4"/><path d="M4 18v-4.4a1.8 1.8 0 0 1 1.8-1.8h12.4a1.8 1.8 0 0 1 1.8 1.8V18"/><path d="M6.6 11.8v-1.4a1.4 1.4 0 0 1 1.4-1.4h2.6a1.4 1.4 0 0 1 1.4 1.4v1.4"/><path d="M16.2 3.2a3.4 3.4 0 1 0 3.7 4.3 2.7 2.7 0 0 1-3.7-4.3z"/>'),
    seat:   I('<path d="M7 3.5c1.4 0 2.3.8 2.6 2.2l1.9 8.3h6.2a1.8 1.8 0 0 1 1.8 1.8V18H9.8a2 2 0 0 1-1.9-1.5L5.2 5.7C5 4.5 5.8 3.5 7 3.5z"/><path d="M11 18v2.6M17 18v2.6M9 20.6h10"/>'),
    bag:    I('<rect x="3.5" y="7" width="17" height="12.5" rx="2"/><path d="M9 7V5.2A1.2 1.2 0 0 1 10.2 4h3.6A1.2 1.2 0 0 1 15 5.2V7"/><path d="M8 7v12.5M16 7v12.5"/>'),
    engine: I('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.2"/><path d="M12 9.8V3.2M14.1 11.3l6.2-2.3M13.4 13.8l4.2 5M10.6 13.8l-4.2 5M9.9 11.3 3.7 9"/>'),
    year:   I('<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.6h17M8 3v4M16 3v4"/>', 1.5),
    hours:  I('<circle cx="12" cy="12" r="8.8"/><path d="M12 7.2V12l3.2 2"/>', 1.5),
    range:  I('<path d="M3 17.5c2.6-6.4 5.6-9.6 9-9.6s6.4 3.2 9 9.6" stroke-dasharray="2.2 2.4"/><circle cx="3" cy="17.5" r="1.5" fill="currentColor" stroke="none"/><circle cx="21" cy="17.5" r="1.5" fill="currentColor" stroke="none"/>', 1.5),
    seats:  I('<path d="M7 3.5c1.4 0 2.3.8 2.6 2.2l1.9 8.3h6.2a1.8 1.8 0 0 1 1.8 1.8V18H9.8a2 2 0 0 1-1.9-1.5L5.2 5.7C5 4.5 5.8 3.5 7 3.5z"/><path d="M11 18v2.6M17 18v2.6M9 20.6h10"/>', 1.5),
    tail:   I('<path d="M4.5 19.5h15l-3.2-2.6h-5.1L8 4.5H5.4z"/><path d="M8.6 9.2h1.6"/>', 1.5)
  };

  window.AP_DESK = {
    lamp:   null,
    laptop: null,
    mug:    B + "assets/images/desk/mug.webp",
    ring:   B + "assets/images/desk/ring.webp"
  };

  window.VELA = {
    "g550": {
      name:     "Gulfstream G550",
      tab:      "G550",
      maker:    "Gulfstream",
      model:    "G550",
      year:     2014,
      serial:   "5462",
      tail:     "N550VQ",
      base:     "Teterboro, NJ",
      icao:     "KTEB",
      price:    "",
      status:   "available",
      hours:    "4,612",
      landings: "2,148",
      range:    "6,750",
      seats:    16,
      sleeps:   6,
      engines:  "Rolls-Royce BR710, on CorporateCare",
      avionics: "PlaneView, EVS II, FANS-1/A, ADS-B Out",
      interior: "Sixteen seats, forward galley, aft stateroom",
      paint:    "Matterhorn White, 2022",
      note:     "One owner since new, Part 91 only, hangared in Teterboro. Fresh 72-month inspection and a cabin that has never seen a charter passenger.",
      photos: [
        ["photo-1684838200888-192e2a163cc9", "Gulfstream G550 on the ramp"],
        ["photo-1719351030888-ad8fd251be38", "The G550 in flight above the clouds"],
        ["photo-1768346564233-d71f37bd19b6", "G550 cabin with club seating"],
        ["photo-1610094273627-f97d5bc5084e", "G550 PlaneView flight deck"],
        ["photo-1772161166556-67d412d8ac76", "In the hangar at Teterboro"]
      ],
      features: [
        ["wifi",   "Ka-band Wi-Fi"],
        ["galley", "Forward galley"],
        ["lav",    "Two lavatories"],
        ["sleep",  "Sleeps 6"],
        ["bag",    "In-flight baggage"],
        ["engine", "RR CorporateCare"]
      ],
      notes: [
        { name:"Seller, via counsel", date:"Oct 2026", title:"On the decision to sell",
          text:"We flew her to Geneva and back more times than I can count. Find someone who will use the range." },
        { name:"R. Halloran", date:"Sep 2026", title:"Chief pilot",
          text:"Every squawk closed the day it was written. The logbooks read like a manual." }
      ]
    },
    "f900": {
      name:     "Falcon 900LX",
      tab:      "900LX",
      maker:    "Dassault",
      model:    "Falcon 900LX",
      year:     2016,
      serial:   "296",
      tail:     "N916VX",
      base:     "Palm Beach, FL",
      icao:     "KPBI",
      price:    "",
      status:   "contract",
      hours:    "3,140",
      landings: "1,602",
      range:    "4,750",
      seats:    12,
      sleeps:   5,
      engines:  "Three Honeywell TFE731-60, on MSP Gold",
      avionics: "EASy II, FalconEye, FANS-1/A",
      interior: "Twelve seats in three lounges, full aft lav",
      paint:    "White over Pewter, 2021",
      note:     "Accepted offer; pre-buy underway in Savannah. Ask to be told first if it returns to market.",
      photos: [
        ["photo-1781901758547-d62aaa8eddc9", "Dassault Falcon 900LX, three-engine trijet"],
        ["photo-1616620418290-81a162f05e5d", "The 900LX from the wingtip"],
        ["photo-1768346564210-f382cdf18375", "Falcon 900LX cabin, forward lounge"],
        ["photo-1518566107615-f7267099eced", "EASy II flight deck"]
      ],
      features: [
        ["wifi",   "Ka-band Wi-Fi"],
        ["galley", "Full galley"],
        ["lav",    "Enclosed aft lav"],
        ["sleep",  "Sleeps 5"],
        ["bag",    "In-flight baggage"],
        ["engine", "MSP Gold, all three"]
      ],
      notes: [
        { name:"Buyer's counsel", date:"Nov 2026", title:"Letter of intent",
          text:"Pre-buy booked for Savannah. Client asked that the cabin stay exactly as it is." },
        { name:"M. Duret", date:"Aug 2026", title:"Seller",
          text:"Three engines over the Atlantic is a feeling you do not give up lightly." }
      ]
    },
    "cl350": {
      name:     "Challenger 350",
      tab:      "CL350",
      maker:    "Bombardier",
      model:    "Challenger 350",
      year:     2019,
      serial:   "20784",
      tail:     "N350KV",
      base:     "Scottsdale, AZ",
      icao:     "KSDL",
      price:    "$19,950,000",
      status:   "available",
      hours:    "1,890",
      landings: "1,215",
      range:    "3,200",
      seats:    10,
      sleeps:   4,
      engines:  "Honeywell HTF7350, on MSP Gold",
      avionics: "Pro Line 21 Advanced, HUD, FANS-1/A",
      interior: "Ten seats, double club, forward galley",
      paint:    "Original, 2019",
      note:     "Low time, a single corporate owner, Ka-band and a head-up display. Hangared since delivery.",
      photos: [
        ["photo-1474302770737-173ee21bab63", "Challenger 350 on the ramp at sunset"],
        ["photo-1684838200815-36eef38f353c", "Challenger 350, port side"],
        ["photo-1625513123245-fcb02d69ad12", "Challenger 350 cabin, double club"],
        ["photo-1661954864180-e61dea14208a", "Winglet and engine detail"],
        ["photo-1635668422724-fffb2201f951", "HTF7350 engine, cowling open"]
      ],
      features: [
        ["wifi",   "Ka-band Wi-Fi"],
        ["galley", "Forward galley"],
        ["lav",    "Enclosed aft lav"],
        ["sleep",  "Sleeps 4"],
        ["bag",    "In-flight baggage"],
        ["engine", "MSP Gold"]
      ],
      notes: [
        { name:"Director of aviation", date:"Oct 2026", title:"Seller",
          text:"Coast to coast with four on board and fuel to spare. We are only selling because the fleet changed." },
        { name:"T. Okafor", date:"Jul 2026", title:"Pre-buy, 2024",
          text:"Cleanest 350 through our shop that year. Nothing deferred." }
      ]
    },
    "cj4": {
      name:     "Citation CJ4",
      tab:      "CJ4",
      maker:    "Cessna",
      model:    "Citation CJ4",
      year:     2017,
      serial:   "525C-0241",
      tail:     "N417VE",
      base:     "Naples, FL",
      icao:     "KAPF",
      price:    "",
      status:   "available",
      hours:    "2,260",
      landings: "2,031",
      range:    "2,165",
      seats:    8,
      sleeps:   0,
      engines:  "Williams FJ44-4A, on TAP Blue",
      avionics: "Pro Line 21, synthetic vision, ADS-B In",
      interior: "Seven seats plus belted lav, club four",
      paint:    "Original, 2017",
      note:     "Single pilot, two owners, every logbook since new. The sensible choice that never feels like one.",
      photos: [
        ["photo-1772354815085-0cb07ca438fe", "Citation CJ4 on the apron"],
        ["photo-1772354955308-acdbdbc39365", "The CJ4 from the nose"],
        ["photo-1772354967311-167285eaa5f5", "CJ4 cabin, club four"],
        ["photo-1581300907482-9ab70b31b69f", "Pro Line 21 flight deck"]
      ],
      features: [
        ["wifi",   "Cabin Wi-Fi"],
        ["galley", "Refreshment center"],
        ["lav",    "Belted aft lav"],
        ["seat",   "Seven seats"],
        ["bag",    "Nose and aft baggage"],
        ["engine", "TAP Blue"]
      ],
      notes: [
        { name:"Owner-pilot", date:"Sep 2026", title:"Seller",
          text:"Naples to Nantucket in one go, every summer. Moving up, not on." },
        { name:"J. Brandt", date:"Jun 2026", title:"Buyer, an earlier CJ4",
          text:"They told us what was wrong with it before we asked. That is why we came back." }
      ]
    },
    "cl605": {
      name:     "Challenger 605",
      tab:      "CL605",
      maker:    "Bombardier",
      model:    "Challenger 605",
      year:     2012,
      serial:   "5891",
      tail:     "N605LM",
      base:     "Aspen, CO",
      icao:     "KASE",
      price:    "",
      status:   "available",
      hours:    "5,340",
      landings: "3,077",
      range:    "4,000",
      seats:    12,
      sleeps:   5,
      engines:  "GE CF34-3B, on OnPoint",
      avionics: "Pro Line 21, FANS-1/A, CPDLC",
      interior: "Twelve seats, aft divan, refreshed 2023",
      paint:    "Snow White and Graphite, 2023",
      note:     "Mountain-based and meticulously kept. Recent paint, a refreshed cabin and an aft divan that sleeps two.",
      photos: [
        ["photo-1770334618960-d246fc142297", "Challenger 605 on a snowy ramp"],
        ["photo-1734750358398-917f1da67c1f", "Challenger 605 at rest"],
        ["photo-1700811476970-2b42838f5f09", "Challenger 605 cabin, forward club"],
        ["photo-1772354852092-0685c2bf32b2", "Aft cabin and divan"],
        ["photo-1783098269685-49990ec0f9c9", "On the tarmac at dusk"]
      ],
      features: [
        ["wifi",   "Cabin Wi-Fi"],
        ["galley", "Full galley"],
        ["lav",    "Enclosed aft lav"],
        ["sleep",  "Sleeps 5"],
        ["bag",    "In-flight baggage"],
        ["engine", "GE OnPoint"]
      ],
      notes: [
        { name:"Family office", date:"Oct 2026", title:"Seller",
          text:"Ten winters in and out of Aspen without a single cancelled trip. It has earned a softer life." },
        { name:"K. Lindqvist", date:"Aug 2026", title:"Maintenance director",
          text:"Hot section done early. Paint is better than factory." }
      ]
    }
  };

  /* the lines everything else shares */
  window.VELA_LINE = {
    status: function(p){ return p.status === 'available' ? 'Available' : 'Under contract'; },
    price:  function(p){ return p.price || 'Price on request'; },
    specs:  function(p){
      return p.year + ' · ' + p.hours + ' hrs · ' + p.range + ' nm · ' + p.seats + ' seats';
    },
    meta:   function(p){ return p.tail + ' · ' + p.base; },
    cta:    function(p){ return p.status === 'available' ? 'View the aircraft ' : 'Notify me '; }
  };
})();
