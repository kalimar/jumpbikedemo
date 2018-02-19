require 'csv'
require 'net/http'
require 'json'
require 'open-uri'
require 'byebug'

# INPUT_FILE = '.data/five-pm-routes-with-geometries.csv'.freeze
# Need to have outputs for different times of day
# OUTPUT_FILE = './data/five-pm-bike-routes-with-geometries.csv'.freeze

@TOKEN = 'pk.eyJ1Ijoia2FsaW1hciIsImEiOiJjajdhdmNtMjkwbGZlMzJyc2RvNmhjZXd3In0.tBIY2rRDHYt1VYeGTOH98g'

@TIME_STAMP_FORMAT = '%m/%e/%y %H:%M'

# Generates the csv file with the appropriate headers
def build_output_csv
  # headers = %w[route_id longitude latitude dest_long dest_lat distance time_start jump_geometry jump_duration car_geometry car_duration shorter]
  headers = %w[route_id longitude latitude dest_long dest_lat distance time_start jump_duration car_duration shorter]
  CSV.open(OUTPUT_FILE, 'w', write_headers: true, headers: headers) do |csv|
    csv << [nil]
  end
end

# Appends a line to output.csv
def add_line_to_csv(arr)
  CSV.open(OUTPUT_FILE, 'a') do |csv|
    csv << arr
  end
end

# Makes the api request and returns the hash
# takes a hash
def request_car_route_from(coordinates)
  url = 'https://api.mapbox.com/directions/v5/mapbox/driving-traffic/'
  url += "#{coordinates[:origin_lat]},#{coordinates[:origin_long]};"
  url += "#{coordinates[:dest_lat]},#{coordinates[:dest_long]}?access_token=#{@TOKEN}"
  # url += '&geometries=geojson'
  uri = URI(url)
  response = Net::HTTP.get(uri)
  JSON.parse(response)
end

def request_jump_route_from(coordinates)
  url = 'https://api.mapbox.com/directions/v5/mapbox/cycling/'
  url += "#{coordinates[:origin_lat]},#{coordinates[:origin_long]};"
  url += "#{coordinates[:dest_lat]},#{coordinates[:dest_long]}?access_token=#{@TOKEN}"
  # url += with_geo && '&geometries=geojson'
  uri = URI(url)
  response = Net::HTTP.get(uri)
  JSON.parse(response)
end
# Returns the driving eta with traffic
# takes a JSON object

def get_car_duration_from(route_object)
  route_object['routes'].first['duration']
end

# def get_geometry_from(route_object)
#   route_object['routes'].first && route_object['routes'].first['geometry']
# end
#
# def build_route_geometry(route_object)
#   return '' unless route_object['routes']
#   route_object['routes']
#   route = get_geometry_from route_object
#   json_feature = { type: 'Feature', properties: {}, geometry: route }
#   json_feature.to_json
# end
#
def convert_seconds_to_h_m_s(time_in_seconds)
  seconds = time_in_seconds % 60
  minutes = (time_in_seconds / 60) % 60
  hours = time_in_seconds / 3600
  format('%02d:%02d:%02d', hours, minutes, seconds)
end

# Makes the array with origin and destination
# Assumes the csv has specific headers
def build_coordinates_hash_from(csv_row)
  {
    origin_lat: csv_row['latitude'],
    origin_long: csv_row['longitude'],
    dest_lat: csv_row['dest_lat'],
    dest_long: csv_row['dest_long']
  }
end

def jump_route_is_shorter?(jump_duration, car_duration)
  # p jump_duration && short_flag(jump_duration < car_duration)
  jump_duration && short_flag(jump_duration < car_duration)
end

def convert_timestamp_to_seconds(time_stamp, time_format)
  Time.strptime(time_stamp, time_format)
end

def duration_of_bike_ride_in_seconds(start, finish, time_format)
  convert_timestamp_to_seconds(finish, time_format) - convert_timestamp_to_seconds(start, time_format)
end

def short_flag(boolean)
  boolean ? 'true' : nil
end

def add_line?(short_flag, jump_duration, car_duration )
  short_flag && jump_duration > 0 && car_duration > 0
end

def any_nil?(hash)
  hash.values.include? nil
end

# start process of building output.csv
build_output_csv
CSV.foreach(INPUT_FILE, headers: true) do |row|
  next unless row['start_time']
  jump_duration = duration_of_bike_ride_in_seconds(row['start_time'], row['finish_time'], @TIME_STAMP_FORMAT)
  coord_hash = build_coordinates_hash_from row
  car_route_object = request_car_route_from coord_hash
  if car_route_object['routes'] #&& !(any_nil? car_route_object['routes'].first)
    car_duration = get_car_duration_from car_route_object
    short_flag = jump_route_is_shorter? jump_duration, car_duration

    # add code to check and only include data I'm interested in.
    # if (row['longitude'].to_f - row['dest_long'].to_f).abs > (row['latitude'].to_f - row['dest_lat'].to_f).abs
    # if add_line?(short_flag, jump_duration, car_duration)
    # jump_route_object = request_jump_route_from coord_hash
      # bike_geometry = build_route_geometry jump_route_object
      # car_geometry = build_route_geometry car_route_object
      # output_row = [row[0], row['latitude'], row['longitude'], row['dest_lat'], row['dest_long'], row['distance'], row['start_time'], bike_geometry, jump_duration, car_geometry, car_duration, short_flag]
      output_row = [row[0], row['latitude'], row['longitude'], row['dest_lat'], row['dest_long'], row['distance'], row['start_time'], jump_duration, car_duration, short_flag]
      add_line_to_csv output_row
    # end
  end
end
