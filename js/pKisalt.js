!function(t){t.fn.pKisalt=function(i){var e=t.extend({limit:20,nokta:!0,goster:!0,gizle:!0,text:"g�ster",text2:"gizle"},i);return this.each(function(){var i="",s="",a=t(this);if(a.text().length>e.limit){a.wrap('<div class="pKisalt_kisaltilmis"></div>'),1==e.gizle&&(s=' <a href="#" class="pKisalt_gizle">'+e.text2+"</a>"),a.after('<div class="pKisalt_orjinal" style="display: none">'+a.text()+s+"</div>"),1==e.nokta&&(i=".."),1==e.goster&&(i+=' <a href="#" class="pKisalt_goster">'+e.text+"</a>");var l=a.text().substr(0,e.limit)+i;t(this).html(l)}t("a.pKisalt_goster").click(function(){return t(this).parent().hide().next(".pKisalt_orjinal").show(),!1}),t("a.pKisalt_gizle").click(function(){return t(this).parent().hide().prev().show(),!1})})}}(jQuery);