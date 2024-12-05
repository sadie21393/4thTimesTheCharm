#!/usr/bin/env bash
# Place in .platform/hooks/postdeploy directory
sudo certbot -n -d turtlesheltergroup310.is404.net --nginx --agree-tos --email intexgroup310@gmail.com
sudo certbot -n -d Shelter-eb-env.eba-bgugpdgy.us-east-1.elasticbeanstalk.com --nginx --agree-tos --email intexgroup310@gmail.com