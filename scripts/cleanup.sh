#!/bin/bash
killall node || true
cd /home/ubuntu/server
cp ./config.json ../
rm -rf ./*
cp ../config.json ./
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -m ec2 -a stop || true