#!/bin/bash
source /home/ubuntu/.bashrc
source /home/ubuntu/.nvm/nvm.sh
cd /home/ubuntu/server
npm install
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
	-a fetch-config -m ec2 \
	-c file:/home/ubuntu/server/cloudwatch-config.json -s