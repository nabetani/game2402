L=6
all=[]
sizes=[]
(1..L).each do |level|
  list= []
  d = (85 * 0.65**((L-level)/L.to_f)).round
  sizes<<[level,d]
  puts "d=#{d}"
  sat = (level*100.0/L).round
  %w( ta i tu ).each do |x|
    dest = "tmp/#{x}.png"
    %x(convert t#{level}.png -trim -resize 200x200 -background transparent -gravity center -extent 200x200 tmp/tmp.png)
    %x(convert #{x}.png -modulate 100,#{sat} tmp/s.png)
    %x(composite -compose over tmp/s.png tmp/tmp.png tmp/tmp.png)
    %x(convert  tmp/tmp.png -resize #{d}x#{d} #{dest})
    list << dest
  end
  `convert +append #{list.join(" ")} ../src/assets/t#{level}.webp`
  all << "../src/assets/t#{level}.webp"
end

`convert -append #{all.join(" ")} tmp/all.webp`
p sizes
