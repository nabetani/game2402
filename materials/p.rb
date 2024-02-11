L=6
(1..L).each do |level|
  list= []
  d = (80 * 0.7**((L-level)/L.to_f)).round
  %w( ta i tu ).each do |x|
    dest = "tmp/#{x}.png"
    %x(composite -compose over #{x}.png t#{level}.png tmp/tmp.png)
    %x(convert  tmp/tmp.png -resample #{d}x#{d} #{dest})
    list << dest
  end
  `convert +append #{list.join(" ")} tmp/t#{level}.webp`
end
