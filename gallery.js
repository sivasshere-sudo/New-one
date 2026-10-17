/* Gallery images. To use your own photos: put them in assets/gallery/ and change the file names below
   (or just replace a file and keep the same name). Add or remove lines to show more or fewer images. */
var PAGES={
  1:[
    ["assets/gallery/g1-1.svg","Stop sign"],
    ["assets/gallery/g1-2.svg","Give way sign"],
    ["assets/gallery/g1-3.svg","No entry sign"],
    ["assets/gallery/g1-4.svg","Speed limit sign"],
    ["assets/gallery/g1-5.svg","No parking sign"],
    ["assets/gallery/g1-6.svg","One way sign"],
    ["assets/gallery/g1-7.svg","Pedestrian crossing ahead sign"],
    ["assets/gallery/g1-8.svg","Sharp curve ahead sign"]
  ],
  2:[
    ["assets/gallery/g2-1.svg","Always wear your seat belt"],
    ["assets/gallery/g2-2.svg","Traffic light meanings"],
    ["assets/gallery/g2-3.svg","Mirror, signal, manoeuvre"],
    ["assets/gallery/g2-4.svg","Keep a safe distance"],
    ["assets/gallery/g2-5.svg","Do not use a phone while driving"],
    ["assets/gallery/g2-6.svg","Give way at a zebra crossing"],
    ["assets/gallery/g2-7.svg","Keep to the left"],
    ["assets/gallery/g2-8.svg","Never drink and drive"]
  ]
};
(function(){
  var grid=document.getElementById('grid');if(!grid)return;
  (PAGES[grid.getAttribute('data-page')]||[]).forEach(function(it){
    var s=document.createElement('div');s.className='shot glass';s.setAttribute('data-name','Missing image: '+it[0]);
    var im=new Image();im.alt=it[1];im.loading='lazy';im.src=it[0];
    im.onerror=function(){s.classList.add('empty')};
    s.appendChild(im);grid.appendChild(s);
  });
})();
