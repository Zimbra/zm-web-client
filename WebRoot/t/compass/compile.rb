$LOAD_PATH.unshift "#{ARGV[0]}"  
require 'rubygems'
require 'sass'
require 'compass'  
require 'compass/exec'  
   
exit Compass::Exec::SubCommandUI.new([ARGV[1], ARGV[2], "-q"]).run! 
