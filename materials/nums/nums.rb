
w=39
h=70

name = { "万"=>"man", "億"=>"oku", "点"=>"ten" }

[*0..9, "万", "億", "点"].each do |x|
  z= Numeric===x ? 5 : 12
  w0=w*z
  h0=h*z
  m=z*5
  w1=w*z+m*2
  h1=h*z+m*2
  weight = 4
  gb=" -gaussian-blur #{25}x#{10}"
  `convert -size #{w1/4}x#{h1/4} xc: +noise Random #{gb} -resize 400% -crop #{w0}x#{h0}+#{m}+#{m} -auto-level -auto-level n.png`
  `magick  -background black -fill white -font "ヒラギノ丸ゴ-Pro-W#{weight}" \
            -size #{w0}x#{h0} -gravity south label:#{x} \
            a.png`
  `convert n.png a.png -compose multiply -composite  #{gb} -spread 25 -gaussian-blur 5x2 -paint 20 -paint 20 -auto-level b.png`
  `convert b.png -colorspace HSL -separate lumi.png`
  `convert lumi-2.png -evaluate add -20000 -evaluate multiply 65535 -evaluate multiply 65535 alpha.png`
  `convert b.png -colorspace RGB -separate p.png`
  n = name[x] || x
  `convert p-0.png p-1.png p-2.png alpha.png -combine -auto-level -modulate 60 #{n}.png`
  p x
end

list = [*0..9,"man", "oku", "ten"].map{ "#{_1}.png" }.join(" ")
`convert +append #{list} -resize #{w*12}x#{h} ../../src/assets/nums.webp`
`rm *.png`
