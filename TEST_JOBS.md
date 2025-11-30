#!/bin/bash

# Test job insert - Copy and paste these curl commands into your terminal

# Test 1: Simple job entry

curl -X POST http://localhost:5173/api/test-insert

# Or manually test with a single entry by running this Node.js code in your dev console:

#

# const job = {

# title: 'Test Senior Engineer',

# company: 'Test Company',

# description: 'A simple test job description without any HTML or special characters',

# salary: '$100,000 - $150,000',

# postedDate: new Date(),

# sourceUrl: 'https://test.example.com/test-job-1',

# sourceName: 'TestSource',

# tags: ['backend', 'test']

# };

#

# // Insert directly using fetch to /api/jobs or create your own test endpoint
