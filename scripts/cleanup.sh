#!/bin/bash
killall node || true
cd /home/ubuntu/server
cp ./config.json ../
rm -rf ./*
cp ../config.json ./