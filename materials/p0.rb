W0=H0=55
L=4
(1..L).each do |c|
  %w( ta i tu ).each do |x|
    dest = "../src/assets/#{x}_#{c}.webp"
    sat=150*c/L
    %x(convert #{x}.png -modulate 100,#{sat} tmp.png)
    %x(composite -compose over tmp.png tb#{c}.png -resize #{W0}x#{H0} #{dest})
  end
end
