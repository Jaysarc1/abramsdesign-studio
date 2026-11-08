/* Arden House · the room record the board reads.
   LIB holds every material and product as a snapshot (maker, finish, size, price, where it came from, the day it was captured).
   ROOMS holds what each room has chosen (selections) and how its walls are composed (elevations, in inches). */
const TODAY = 'Oct 31, 2026';
const HOUSE = {name:'Arden House', rev:'Rev 17.8'};

/* sw: swatch recipe. rep: repeat size in inches when the swatch fills a surface. */
const LIB = {
  // paint and plaster
  'pt-dove':   {cat:'Paint', name:'White Dove OC-17', maker:'Benjamin Moore', host:'benjaminmoore.com', finish:'Regal Select, matte', size:'1 gal', price:92, unit:'gal', sw:{k:'paint', c:'#ece8dd'}, rep:48},
  'pt-lace':   {cat:'Paint', name:'Chantilly Lace OC-65', maker:'Benjamin Moore', host:'benjaminmoore.com', finish:'Advance, semi-gloss', size:'1 gal', price:96, unit:'gal', sw:{k:'paint', c:'#f3f2ec'}, rep:48},
  'pt-studio': {cat:'Paint', name:'Studio Green No. 93', maker:'Farrow & Ball', host:'farrow-ball.com', finish:'Estate Emulsion', size:'2.5 L', price:139, unit:'can', sw:{k:'paint', c:'#2f3b34'}, rep:48},
  'pl-sand':   {cat:'Plaster', name:'Lime plaster, Sand', maker:'Studio applied', host:'', finish:'Hand-troweled, burnished', size:'Per sf', price:24, unit:'sf', sw:{k:'plaster', c:'#e1d6c4'}, rep:96},
  // wallcovering
  'wc-martinique': {cat:'Wallcovering', name:'Martinique', maker:'CW Stockwell', host:'cwstockwell.com', finish:'Screen printed, paper', size:'27 in. × 4.5 yd roll', price:265, unit:'roll', sw:{k:'leaf', c:'#f2efe4', a:'#2f5a3c', b:'#5c8a4f'}, rep:27},
  'wc-abaca':  {cat:'Wallcovering', name:'Abaca grasscloth, Natural', maker:'Phillip Jeffries', host:'phillipjeffries.com', finish:'Handwoven abaca on paper', size:'36 in. wide', price:118, unit:'yd', sw:{k:'grass', c:'#cdb894'}, rep:36},
  // wood
  'wd-oak':    {cat:'Wood', name:'White oak, wide plank', maker:'Per flooring contractor', host:'', finish:'Rift sawn, matte oil', size:'9 in. plank, random length', price:16.5, unit:'sf', sw:{k:'wood', c:'#c9ad86', w:9}, rep:72},
  'wd-walnut': {cat:'Wood', name:'Walnut, book-matched', maker:'Custom millwork', host:'', finish:'Slab front, satin', size:'Per linear ft', price:1450, unit:'lf', sw:{k:'wood', c:'#6b4a33', w:30, v:1}, rep:60},
  // stone
  'st-laza':   {cat:'Stone', name:'Calacatta Laza quartz', maker:'MSI', host:'msisurfaces.com', finish:'Polished, 3 cm, eased edge', size:'Slab 65 × 130 in.', price:92, unit:'sf', sw:{k:'stone', c:'#f1efea', v:'#9b958a', n:7}, rep:96},
  'st-crema':  {cat:'Stone', name:'Crema limestone', maker:'Per stone yard', host:'', finish:'Honed', size:'24 × 24 in.', price:38, unit:'sf', sw:{k:'tile', c:'#ddd0b8', tw:24, th:24, g:'#cbbda3', vary:.05}, rep:48},
  'st-statu':  {cat:'Stone', name:'Statuarietto marble', maker:'Per stone yard', host:'', finish:'Honed slab, 2 cm', size:'Slab', price:124, unit:'sf', sw:{k:'stone', c:'#eeece6', v:'#7f7c76', n:11}, rep:72},
  'st-trav':   {cat:'Stone', name:'Silver travertine', maker:'Per stone yard', host:'', finish:'Filled, honed', size:'Slab', price:46, unit:'sf', sw:{k:'trav', c:'#d8d0c2'}, rep:48},
  // tile
  'tl-hex':    {cat:'Tile', name:'Limestone hex mosaic', maker:'Floor & Decor', host:'flooranddecor.com', finish:'Honed', size:'2 in. hex on 12 in. mesh', price:18.99, unit:'sf', sw:{k:'hex', c:'#d9ceb9', s:2}, rep:12},
  'tl-zellige':{cat:'Tile', name:'Zellige, Weathered White', maker:'Clé', host:'cletile.com', finish:'Glazed, handmade', size:'2 × 6 in.', price:38, unit:'sf', sw:{k:'tile', c:'#efece3', tw:6, th:2, g:'#e2ddd2', vary:.07, gloss:1, lay:'stack'}, rep:24},
  'tl-tulum':  {cat:'Tile', name:'Tulum limestone', maker:'Floor & Decor', host:'flooranddecor.com', finish:'Honed', size:'24 × 48 in.', price:8.99, unit:'sf', sw:{k:'tile', c:'#dccfb9', tw:48, th:24, g:'#cbbfa8', vary:.04, lay:'brick'}, rep:96},
  // textile, leather, metal
  'tx-linen':  {cat:'Textile', name:'Belgian linen, Oatmeal', maker:'Libeco', host:'libeco.com', finish:'Washed, medium weight', size:'Per yard', price:98, unit:'yd', sw:{k:'linen', c:'#d9cfbf'}, rep:8},
  'tx-boucle': {cat:'Textile', name:'Bouclé, Ivory', maker:'Holland & Sherry', host:'hollandandsherry.com', finish:'Wool blend', size:'Per yard', price:186, unit:'yd', sw:{k:'boucle', c:'#ebe5d8'}, rep:6},
  'tx-cognac': {cat:'Leather', name:'Aniline leather, Cognac', maker:'Moore & Giles', host:'mooreandgiles.com', finish:'Full grain, waxed', size:'Per hide', price:24, unit:'sf', sw:{k:'leather', c:'#8a4f2c'}, rep:12},
  'mt-brass':  {cat:'Metal', name:'Aged brass', maker:'Finish standard', host:'', finish:'Satin, living finish', size:'All plumbing, lighting and hardware', price:0, unit:'', sw:{k:'brass', c:'#b18c52'}, rep:12},
  'mt-bronze': {cat:'Metal', name:'Bronze frame', maker:'Per glazing contractor', host:'', finish:'Dark bronze anodized', size:'Window and door frames', price:0, unit:'', sw:{k:'brass', c:'#4a3b2e'}, rep:12},

  // primary bedroom
  'fn-bed':    {cat:'Furniture', name:'Upholstered platform bed, king', maker:'RH', host:'rh.com', finish:'Bouclé, Ivory; walnut plinth', size:'86 × 90 in., 48 in. headboard', dim:[86,48], price:6995, unit:'ea', draw:'bed', mat:'tx-boucle'},
  'fn-night':  {cat:'Furniture', name:'Two-drawer nightstand', maker:'CB2', host:'cb2.com', finish:'Walnut', size:'28 × 18 × 24 in.', dim:[28,24], price:899, unit:'ea', draw:'night', mat:'wd-walnut'},
  'lt-cone':   {cat:'Lighting', name:'Plaster cone wall sconce', maker:'Visual Comfort', host:'visualcomfort.com', finish:'Aged brass, linen shade', size:'7 × 13 in.', dim:[7,13], price:429, unit:'ea', draw:'sconce'},
  'ar-pair':   {cat:'Art', name:'Palm study, framed photograph', maker:'Saatchi Art', host:'saatchiart.com', finish:'Oak frame, white mat', size:'30 × 40 in.', dim:[30,40], price:1200, unit:'ea', draw:'art', art:1},
  'tx-lumbar': {cat:'Textile', name:'Channel-stitched lumbar pillow', maker:'Wayfair', host:'wayfair.com', finish:'Leather, Cognac', size:'48 × 14 in.', dim:[48,13], price:189, unit:'ea', draw:'pillow', mat:'tx-cognac'},
  'pn-bird':   {cat:'Plants', name:'Bird of paradise, 6 ft', maker:'The Sill', host:'thesill.com', finish:'In a plaster planter', size:'72 in. tall', dim:[34,72], price:395, unit:'ea', draw:'plant'},
  'tx-drape':  {cat:'Textile', name:'Linen drapery panel', maker:'Custom workroom', host:'', finish:'Belgian linen, Oatmeal, ripplefold', size:'60 × 118 in.', dim:[30,118], price:1850, unit:'ea', draw:'drape', mat:'tx-linen'},
  'fn-chair':  {cat:'Furniture', name:"Grandfather's chair", maker:'Existing, kept', host:'', finish:'Oak frame, reupholstered seat', size:'29 × 31 in.', dim:[29,31], price:0, unit:'ea', draw:'chair', keep:1},
  'fn-side':   {cat:'Furniture', name:'Travertine pedestal side table', maker:'CB2', host:'cb2.com', finish:'Silver travertine', size:'18 dia. × 22 in.', dim:[18,22], price:599, unit:'ea', draw:'side', mat:'st-trav'},
  'lt-floor':  {cat:'Lighting', name:'Floor lamp, linen drum', maker:'Visual Comfort', host:'visualcomfort.com', finish:'Aged brass', size:'18 × 62 in.', dim:[18,62], price:849, unit:'ea', draw:'flamp'},
  // kitchen
  'cb-base':   {cat:'Cabinetry', name:'Base cabinets, slab front', maker:'Custom millwork', host:'', finish:'Walnut, book-matched; brass edge pulls', size:'24 in. deep, 34¾ in. high', dim:[162,35], price:1450, unit:'lf', draw:'cabs', mat:'wd-walnut'},
  'pl-purist': {cat:'Plumbing', name:'Purist pull-down kitchen faucet', maker:'Kohler', host:'kohler.com', finish:'Vibrant Brushed Moderne Brass', size:'17⅝ in. spout height', dim:[10,18], price:1129, unit:'ea', draw:'faucet'},
  'pl-sink':   {cat:'Plumbing', name:'Undermount sink, 36 in.', maker:'Kohler', host:'kohler.com', finish:'Stainless steel', size:'36 × 19 in.', price:1150, unit:'ea', sw:{k:'brass', c:'#c4c6c3'}},
  'ap-wolf':   {cat:'Appliances', name:'48 in. rangetop, six burners and griddle', maker:'Wolf', host:'subzero-wolf.com', finish:'Stainless steel', size:'48 in. wide', dim:[48,7], price:9435, unit:'ea', draw:'range'},
  'lt-globe':  {cat:'Lighting', name:'Hand-blown globe pendant', maker:'Visual Comfort', host:'visualcomfort.com', finish:'Clear glass, aged brass canopy', size:'12 in. globe', dim:[12,12], price:899, unit:'ea', draw:'pendant'},
  'hw-edge':   {cat:'Hardware', name:'Edge pull, 6 in.', maker:'Top Knobs', host:'topknobs.com', finish:'Honey bronze', size:'6 in.', price:48, unit:'ea', mat:'mt-brass'},
  // guest bath
  'pl-vanity': {cat:'Plumbing', name:'30 in. walnut vanity with brass faucet', maker:'Wayfair', host:'wayfair.com', finish:'Walnut, white quartz top, brushed brass', size:'30 × 21 × 34 in.', dim:[30,34], price:1289, unit:'ea', draw:'vanity', mat:'wd-walnut'},
  'pl-wc':     {cat:'Plumbing', name:'Highline Arc toilet, elongated', maker:'Kohler', host:'homedepot.com', finish:'White', size:'18 × 30 in.', dim:[19,30], price:329, unit:'ea', draw:'wc'},
  'mr-oval':   {cat:'Mirrors', name:'Oval mirror, thin brass frame', maker:'CB2', host:'cb2.com', finish:'Aged brass', size:'22 × 32 in.', dim:[22,32], price:349, unit:'ea', draw:'mirror'},
  'lt-bath':   {cat:'Lighting', name:'Glass cylinder sconce', maker:'Visual Comfort', host:'visualcomfort.com', finish:'Aged brass, opal glass', size:'5 × 14 in.', dim:[5,14], price:289, unit:'ea', draw:'tube'},
  'pl-shower': {cat:'Plumbing', name:'Purist shower trim set', maker:'Kohler', host:'kohler.com', finish:'Vibrant Brushed Moderne Brass', size:'Rain head, valve, hand shower', dim:[30,84], price:1050, unit:'ea', draw:'shower'},
  'gl-panel':  {cat:'Glass', name:'Frameless glass panel, ⅜ in.', maker:'Per glazing contractor', host:'', finish:'Low-iron, brass clamps', size:'30 × 76 in.', dim:[30,76], price:1400, unit:'ea', draw:'glass'},
  // living
  'st-fire':   {cat:'Stone', name:'Fireplace surround', maker:'Per stone yard', host:'', finish:'Crema limestone, honed, 3 in. slab', size:'84 × 60 in.', dim:[84,60], price:6200, unit:'ea', draw:'fire', mat:'st-crema'},
  'ar-large':  {cat:'Art', name:'Large canvas, sea study', maker:'Saatchi Art', host:'saatchiart.com', finish:'Oil on linen, float frame', size:'60 × 48 in.', dim:[60,48], price:4800, unit:'ea', draw:'art', art:2},
  'fn-rope':   {cat:'Furniture', name:'Woven rope lounge chair', maker:'Four Hands', host:'fourhands.com', finish:'Natural rope, teak', size:'30 × 32 in.', dim:[30,32], price:1690, unit:'ea', draw:'chair', mat:'tx-linen', rope:1},
  'pn-kentia': {cat:'Plants', name:'Kentia palm, 9 ft', maker:'Local nursery', host:'', finish:'In a limestone planter', size:'108 in. tall', dim:[48,108], price:495, unit:'ea', draw:'plant', palm:1},
  'fn-sofa':   {cat:'Furniture', name:'Sofa, 120 in.', maker:'RH', host:'rh.com', finish:'Performance linen, Sand', size:'120 × 42 × 29 in.', price:8900, unit:'ea', mat:'tx-linen'},
  'fn-rug':    {cat:'Textile', name:'Hand-knotted wool rug, 12 × 15 ft', maker:'Loloi', host:'loloi.com', finish:'Undyed wool', size:'144 × 180 in.', price:6400, unit:'ea', mat:'tx-boucle'},
  // primary bath
  'pl-double': {cat:'Plumbing', name:'Floating double vanity, 72 in.', maker:'Custom millwork', host:'', finish:'Walnut; Statuarietto top', size:'72 × 22 × 20 in.', dim:[72,20], price:6800, unit:'ea', draw:'float', mat:'wd-walnut'},
  'mr-rect':   {cat:'Mirrors', name:'Arched mirror, brass', maker:'Visual Comfort', host:'visualcomfort.com', finish:'Aged brass', size:'24 × 38 in.', dim:[24,38], price:1180, unit:'ea', draw:'arch'},
  'pl-wide':   {cat:'Plumbing', name:'Purist widespread faucet', maker:'Kohler', host:'kohler.com', finish:'Vibrant Brushed Moderne Brass', size:'8 in. spread, wall-mount', dim:[8,9], price:845, unit:'ea', draw:'wallspout'},
  // foyer, dining, guest bedroom, study
  'fn-console':{cat:'Furniture', name:'Oak console, 84 in.', maker:'Four Hands', host:'fourhands.com', finish:'Bleached oak', size:'84 × 16 × 30 in.', dim:[84,30], price:3400, unit:'ea', draw:'console', mat:'wd-oak'},
  'lt-table':  {cat:'Lighting', name:'Ceramic table lamp', maker:'Visual Comfort', host:'visualcomfort.com', finish:'Ivory glaze, linen shade', size:'16 × 28 in.', dim:[16,28], price:689, unit:'ea', draw:'tlamp'},
  'ar-tall':   {cat:'Art', name:'Charcoal on paper, framed', maker:'Saatchi Art', host:'saatchiart.com', finish:'Walnut frame', size:'40 × 52 in.', dim:[40,52], price:2600, unit:'ea', draw:'art', art:3},
  'fn-board':  {cat:'Furniture', name:'Walnut sideboard, 96 in.', maker:'Custom millwork', host:'', finish:'Walnut, brass pulls', size:'96 × 20 × 32 in.', dim:[96,32], price:5800, unit:'ea', draw:'board', mat:'wd-walnut'},
  'lt-chand':  {cat:'Lighting', name:'Ring chandelier, 48 in.', maker:'Visual Comfort', host:'visualcomfort.com', finish:'Aged brass, linen shades', size:'48 in. dia.', dim:[48,30], price:3200, unit:'ea', draw:'chand'},
  'fn-table':  {cat:'Furniture', name:'Dining table, 120 in.', maker:'RH', host:'rh.com', finish:'Silver travertine', size:'120 × 46 in.', price:7900, unit:'ea', mat:'st-trav'},
  'fn-dchair': {cat:'Furniture', name:'Woven dining chair', maker:'Four Hands', host:'fourhands.com', finish:'Natural rope, teak', size:'21 × 23 × 31 in.', price:690, unit:'ea', mat:'tx-linen'},
  'fn-queen':  {cat:'Furniture', name:'Linen bed, queen', maker:'Crate & Barrel', host:'crateandbarrel.com', finish:'Belgian linen, Oatmeal', size:'66 × 86 in., 44 in. headboard', dim:[66,44], price:2400, unit:'ea', draw:'bed', mat:'tx-linen'},
  'fn-shelf':  {cat:'Cabinetry', name:'Built-in shelving wall', maker:'Custom millwork', host:'', finish:'Walnut', size:'120 × 14 × 108 in.', dim:[120,108], price:14500, unit:'ea', draw:'shelf', mat:'wd-walnut'},
  'fn-desk':   {cat:'Furniture', name:'Writing desk, 66 in.', maker:'Four Hands', host:'fourhands.com', finish:'Walnut, brass sabots', size:'66 × 30 × 30 in.', dim:[66,30], price:2950, unit:'ea', draw:'desk', mat:'wd-walnut'},
  'fn-dchair2':{cat:'Furniture', name:'Leather desk chair', maker:'CB2', host:'cb2.com', finish:'Cognac leather, walnut', size:'22 × 33 in.', dim:[22,33], price:1099, unit:'ea', draw:'dchair', mat:'tx-cognac'}
};

/* status: Selected, Approved, Quote (priced by a trade quote), Kept (an existing piece) */
const ROOMS = [
  // ground floor
  {id:'foyer', n:'01', name:'Foyer', lvl:'Ground floor', size:"14'-0\" × 22'-0\"", clg:138,
    sel:[
      {t:'PL-1', s:'Walls', l:'pl-sand', q:620},
      {t:'ST-1', s:'Floor', l:'st-crema', q:308},
      {t:'FN-1', s:'Console', l:'fn-console', q:1},
      {t:'LT-1', s:'Lamps', l:'lt-table', q:2},
      {t:'AR-1', s:'Art', l:'ar-tall', q:1}
    ],
    walls:[{id:'A', name:'Console wall', w:168, fin:'PL-1', base:'pt-lace', items:[
      {t:'FN-1', x:42, y:0}, {t:'LT-1', x:48, y:30}, {t:'LT-1', x:104, y:30}, {t:'AR-1', x:64, y:54}
    ]}]},
  {id:'living', n:'02', name:'Living', lvl:'Ground floor', size:"28'-0\" × 27'-3\"", clg:138,
    sel:[
      {t:'PT-1', s:'Walls', l:'pt-dove', q:6},
      {t:'WD-1', s:'Floor', l:'wd-oak', q:763},
      {t:'ST-1', s:'Fireplace', l:'st-fire', q:1},
      {t:'AR-1', s:'Over mantel', l:'ar-large', q:1},
      {t:'FN-1', s:'Lounge chairs', l:'fn-rope', q:2},
      {t:'FN-2', s:'Sofa', l:'fn-sofa', q:1},
      {t:'TX-1', s:'Rug', l:'fn-rug', q:1},
      {t:'PN-1', s:'Palm', l:'pn-kentia', q:1}
    ],
    walls:[{id:'A', name:'Fireplace wall', w:327, fin:'PT-1', base:'pt-lace', items:[
      {t:'PN-1', x:20, y:0}, {t:'FN-1', x:86, y:0}, {t:'ST-1', x:121, y:0}, {t:'AR-1', x:133, y:72}, {t:'FN-1', x:214, y:0}
    ]}]},
  {id:'kitchen', n:'03', name:'Kitchen', lvl:'Ground floor', size:'Open to dining', clg:138,
    sel:[
      {t:'PT-1', s:'Walls', l:'pt-dove', q:3},
      {t:'WD-1', s:'Floor', l:'wd-oak', q:310},
      {t:'CB-1', s:'Base cabinets', l:'cb-base', q:13.5},
      {t:'ST-1', s:'Countertop', l:'st-laza', q:38},
      {t:'ST-2', s:'Backsplash, full slab', l:'st-laza', q:24, st:'Quote'},
      {t:'PL-1', s:'Faucet', l:'pl-purist', q:1},
      {t:'PL-2', s:'Sink', l:'pl-sink', q:1},
      {t:'AP-1', s:'Rangetop', l:'ap-wolf', q:1},
      {t:'LT-1', s:'Island pendants', l:'lt-globe', q:3},
      {t:'HW-1', s:'Cabinet pulls', l:'hw-edge', q:14},
      {t:'MT-1', s:'Metal finish', l:'mt-brass', q:0}
    ],
    walls:[{id:'A', name:'Sink wall', w:162, fin:'PT-1', base:null, win:{x:15, w:132, y:54, h:30}, items:[
      {t:'CB-1', x:0, y:0, w:162}, {t:'ST-2', x:0, y:36.25, w:162, h:17.75, surf:1}, {t:'ST-1', x:0, y:35, w:162, h:1.25, surf:1},
      {t:'AP-1', x:69.5, y:29}, {t:'PL-1', x:28.5, y:36.25}, {t:'LT-1', x:36, y:62, hang:1}, {t:'LT-1', x:75, y:62, hang:1}, {t:'LT-1', x:114, y:62, hang:1}
    ]}]},
  {id:'dining', n:'04', name:'Dining', lvl:'Ground floor', size:"24'-8\" × 26'-6\"", clg:138,
    sel:[
      {t:'PT-1', s:'Walls', l:'pt-dove', q:5},
      {t:'WD-1', s:'Floor', l:'wd-oak', q:654},
      {t:'FN-1', s:'Sideboard', l:'fn-board', q:1},
      {t:'FN-2', s:'Table', l:'fn-table', q:1},
      {t:'FN-3', s:'Chairs', l:'fn-dchair', q:10},
      {t:'LT-1', s:'Chandelier', l:'lt-chand', q:1},
      {t:'LT-2', s:'Lamps', l:'lt-table', q:2},
      {t:'AR-1', s:'Art', l:'ar-large', q:1}
    ],
    walls:[{id:'A', name:'Sideboard wall', w:296, fin:'PT-1', base:'pt-lace', items:[
      {t:'FN-1', x:100, y:0}, {t:'LT-2', x:108, y:32}, {t:'LT-2', x:172, y:32}, {t:'AR-1', x:118, y:62}
    ]}]},
  {id:'scullery', n:'05', name:'Scullery', lvl:'Ground floor', size:'', clg:138, sel:[], walls:[]},
  {id:'powder', n:'06', name:'Powder', lvl:'Ground floor', size:'', clg:138, sel:[], walls:[]},
  {id:'guestbed', n:'07', name:'Guest Bedroom', lvl:'Ground floor', size:"17'-0\" × 15'-6\"", clg:138,
    sel:[
      {t:'WC-1', s:'Bed wall', l:'wc-abaca', q:16},
      {t:'PT-1', s:'Other walls', l:'pt-dove', q:3},
      {t:'WD-1', s:'Floor', l:'wd-oak', q:264},
      {t:'FN-1', s:'Bed', l:'fn-queen', q:1},
      {t:'FN-2', s:'Nightstands', l:'fn-night', q:2},
      {t:'LT-1', s:'Sconces', l:'lt-cone', q:2},
      {t:'AR-1', s:'Art', l:'ar-pair', q:1}
    ],
    walls:[{id:'A', name:'Bed wall', w:186, fin:'WC-1', base:'pt-lace', items:[
      {t:'FN-2', x:24, y:0}, {t:'FN-1', x:60, y:0}, {t:'FN-2', x:134, y:0}, {t:'LT-1', x:34.5, y:52}, {t:'LT-1', x:144.5, y:52}, {t:'AR-1', x:78, y:62}
    ]}]},
  {id:'guestbath', n:'08', name:'Guest Bath', lvl:'Ground floor', size:"7'-9\" × 7'-1\"", clg:120,
    sel:[
      {t:'WC-1', s:'Vanity wall', l:'wc-martinique', q:4},
      {t:'TL-1', s:'Shower walls', l:'tl-zellige', q:70},
      {t:'TL-2', s:'Floor', l:'tl-hex', q:55},
      {t:'PL-1', s:'Vanity', l:'pl-vanity', q:1},
      {t:'PL-2', s:'Toilet', l:'pl-wc', q:1},
      {t:'PL-3', s:'Shower trim', l:'pl-shower', q:1},
      {t:'GL-1', s:'Shower glass', l:'gl-panel', q:1, st:'Quote'},
      {t:'MR-1', s:'Mirror', l:'mr-oval', q:1},
      {t:'LT-1', s:'Sconces', l:'lt-bath', q:2},
      {t:'MT-1', s:'Metal finish', l:'mt-brass', q:0}
    ],
    walls:[
      {id:'A', name:'Vanity wall', w:93, fin:'WC-1', base:null, items:[
        {t:'PL-1', x:10, y:0}, {t:'MR-1', x:14, y:44}, {t:'LT-1', x:3, y:58}, {t:'LT-1', x:41, y:58}, {t:'PL-2', x:62, y:0}
      ]},
      {id:'B', name:'Shower wall', w:85, fin:'TL-1', base:null, items:[
        {t:'PL-3', x:28, y:0}, {t:'GL-1', x:55, y:0}
      ]}
    ]},
  {id:'cabana', n:'09', name:'Guest Cabana', lvl:'Ground floor', size:"28'-0\" × 16'-3\"", clg:138, sel:[], walls:[]},
  // second floor
  {id:'primary', n:'10', name:'Primary Bedroom', lvl:'Second floor', size:"28'-0\" × 21'-0\"", clg:120,
    sel:[
      {t:'WC-1', s:'Bed wall', l:'wc-abaca', q:22},
      {t:'PT-1', s:'Other walls', l:'pt-dove', q:5},
      {t:'PT-2', s:'Trim and base', l:'pt-lace', q:2},
      {t:'WD-1', s:'Floor', l:'wd-oak', q:588},
      {t:'FN-1', s:'Bed', l:'fn-bed', q:1, st:'Approved'},
      {t:'FN-2', s:'Nightstands', l:'fn-night', q:2},
      {t:'LT-1', s:'Sconces', l:'lt-cone', q:2},
      {t:'AR-1', s:'Art, pair', l:'ar-pair', q:2},
      {t:'TX-1', s:'Lumbar pillow', l:'tx-lumbar', q:1},
      {t:'PN-1', s:'Plant', l:'pn-bird', q:1},
      {t:'TX-2', s:'Drapery', l:'tx-drape', q:2},
      {t:'FN-3', s:'Reading chair', l:'fn-chair', q:1, st:'Kept'},
      {t:'FN-4', s:'Side table', l:'fn-side', q:1},
      {t:'LT-2', s:'Floor lamp', l:'lt-floor', q:1}
    ],
    walls:[
      {id:'A', name:'Bed wall', w:252, fin:'WC-1', base:'pt-lace', items:[
        {t:'PN-1', x:10, y:0}, {t:'FN-2', x:52, y:0}, {t:'FN-1', x:83, y:0}, {t:'FN-2', x:172, y:0},
        {t:'LT-1', x:62.5, y:50}, {t:'LT-1', x:182.5, y:50}, {t:'AR-1', x:88, y:62}, {t:'AR-1', x:134, y:62}, {t:'TX-1', x:102, y:27}
      ]},
      {id:'B', name:'Window wall', w:336, fin:'PT-1', base:'pt-lace', door:{x:96, w:144, h:96}, items:[
        {t:'TX-2', x:62, y:0}, {t:'TX-2', x:244, y:0}, {t:'LT-2', x:20, y:0}, {t:'FN-3', x:288, y:0}, {t:'FN-4', x:316, y:0}
      ]}
    ]},
  {id:'primarybath', n:'11', name:'Primary Bath', lvl:'Second floor', size:'', clg:120,
    sel:[
      {t:'ST-1', s:'Vanity wall, slab', l:'st-statu', q:84},
      {t:'ST-2', s:'Floor', l:'tl-tulum', q:160},
      {t:'PL-1', s:'Vanity', l:'pl-double', q:1},
      {t:'PL-2', s:'Faucets', l:'pl-wide', q:2},
      {t:'MR-1', s:'Mirrors', l:'mr-rect', q:2},
      {t:'LT-1', s:'Sconces', l:'lt-bath', q:3},
      {t:'MT-1', s:'Metal finish', l:'mt-brass', q:0}
    ],
    walls:[{id:'A', name:'Vanity wall', w:144, fin:'ST-1', base:null, items:[
      {t:'PL-1', x:36, y:12}, {t:'PL-2', x:49, y:36}, {t:'PL-2', x:87, y:36}, {t:'MR-1', x:41, y:46}, {t:'MR-1', x:79, y:46}, {t:'LT-1', x:27.5, y:62}, {t:'LT-1', x:69.5, y:62}, {t:'LT-1', x:111.5, y:62}
    ]}]},
  {id:'dressing', n:'12', name:'Dressing Room', lvl:'Second floor', size:'', clg:120, sel:[], walls:[]},
  {id:'study', n:'13', name:'Study', lvl:'Second floor', size:"14'-0\" × 20'-8\"", clg:120,
    sel:[
      {t:'PT-1', s:'Walls', l:'pt-studio', q:6},
      {t:'WD-1', s:'Floor', l:'wd-oak', q:289},
      {t:'CB-1', s:'Shelving', l:'fn-shelf', q:1},
      {t:'FN-1', s:'Desk', l:'fn-desk', q:1},
      {t:'FN-2', s:'Desk chair', l:'fn-dchair2', q:1},
      {t:'LT-1', s:'Desk lamp', l:'lt-table', q:1}
    ],
    walls:[{id:'A', name:'Shelving wall', w:168, fin:'PT-1', base:'pt-studio', items:[
      {t:'CB-1', x:24, y:0}, {t:'FN-1', x:51, y:0}, {t:'LT-1', x:58, y:30}, {t:'FN-2', x:86, y:0}
    ]}]},
  {id:'loft', n:'14', name:'Loft', lvl:'Second floor', size:"14'-0\" × 8'-10\"", clg:120, sel:[], walls:[]},
  {id:'bed2', n:'15', name:'Bedroom 2', lvl:'Second floor', size:"19'-6\" × 27'-6\"", clg:120, sel:[], walls:[]},
  {id:'bed3', n:'16', name:'Bedroom 3', lvl:'Second floor', size:"18'-0\" × 22'-0\"", clg:120, sel:[], walls:[]},
  {id:'bed4', n:'17', name:'Bedroom 4', lvl:'Second floor', size:"20'-2\" × 22'-0\"", clg:120, sel:[], walls:[]},
  {id:'lounge', n:'18', name:'Lounge', lvl:'Second floor', size:"26'-0\" × 34'-0\"", clg:120, sel:[], walls:[]}
];
