#!/bin/bash
source /home/ubuntu/.bashrc
source /home/ubuntu/.nvm/nvm.sh
cd /home/ubuntu/server
npm exec forever start server.js