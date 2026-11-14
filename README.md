
## Getting Started


npm install -g pm2
npm install -g pm2-windows-startup

cd C:\sites\clasht-front
pm2 start ecosystem.config.js
pm2 save
pm2-startup install

------------------------------------------------------------------
## ==> and server
pm2 stop all
Remove-Item C:\inetpub\wwwroot\sotui\.next -Recurse -Force
pm2 start C:\inetpub\wwwroot\sotui\ecosystem.config.js