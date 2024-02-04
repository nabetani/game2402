W0=H0=55
(1..4).each do |c|
  %w( ta i tu ).each do |x|
    dest = "../src/assets/#{x}_#{c}.webp"
    %x(composite -compose over #{x}.png tb#{c}.png -resize #{W0}x#{H0} #{dest})
  end
end
