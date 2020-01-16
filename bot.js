var JumperBot = function () {

    var canvas = document.getElementById('swingbot'),

        bot = {},
        bullet = {},
        bars = [],

        // Game variables
        barCount = 3,
        barWidth = 100,
        barHeight = 15,
        bulletSpeed = 15,
        swingSpeed = 30,
        ropeThickness = 2,
        canReset = false, 

     
        scorePosX = 5,    
        scorePosY = 15,   
        firedPointX = 0,   
        firedPointY = 0,  
        barHitPointX = 0, 
        barHitPointY = 0, 
        barHit = false,    
        moveBars = false,  
        firedPointDist = 0, 
        swingX = 0,        
        swingY = 0,         
        currScore = 0,
        topScore = 0,     
        isActive = false, 
        botImg = '',     
        bulletFired = false,
        swingBot = false,     
        relAngleX, relAngleY, relFiredPointX, relFiredPointY; 

    canvas.width = 1400;
    canvas.height = 900;

    context = canvas.getContext('2d');
    context.lineWidth = ropeThickness; 

    function setBullet () {
        bullet.posX = 0;
        bullet.posY = 0;
        bullet.height = 4;
        bullet.width = 4;
    }


    function setBot () {
        bot.width = 24;
        bot.height = 37;
        bot.posX = canvas.width / 2;
        bot.posY = canvas.height - bot.height - 50;

        botImg = new Image();
        botImg.src = "download.svg";
    }

    function setBars () {
      
        bars = [];

        // Generate the bars positions
        for (var i = 0; i < barCount; i++) {
            bars.push({
                posX: Math.random() * ( canvas.width / 2 ),
                posY: (( canvas.height / barCount ) * i) + 20     
            });
        };
    }

    /**
     * Sets up the variables to fire the bullet at specified position
     * @param  int posX X point on canvas which is to be fired at
     * @param  int posY     Y point on canvas which is to be fired at
     */

    function fireBullet ( posX, posY ) {
        barHit = false;
        isActive = true;

        firedPointX = posX;
        firedPointY = posY;

        relFiredPointX = firedPointX - bot.posX;
        relFiredPointY = firedPointY - bot.posY;

        relAngleX = relAngleY = Math.atan2(relFiredPointY, relFiredPointX) * 57.32;

        bulletFired = true;

        canReset = true;
    }


    function populateScore () {
        context.fillText(currScore + '/' + topScore, scorePosX, scorePosY);
    }



    function drawBars () {

        for (var i = 0; i < barCount; i++) {

       
            if ( bars[i].posY > canvas.height ) {

                bars[i].posX = Math.random() * ( canvas.width / 2 );
                bars[i].posY = 0
            }

            if ( moveBars ) {
                bars[i].posY = bars[i].posY - swingY * 4;
            };

            context.fillRect(bars[i].posX, bars[i].posY, barWidth, barHeight);
        };    
    }

  
    function drawPlayer () {
 
        context.drawImage(botImg, bot.posX, bot.posY);
    }

    /**
     * Checks if the game is over or not
     * @return {boolean} True if the game is over and false otherwise
     */

    function isGameOver () {
        return !isActive;
    }

    /**
     * To check if the specified bar number is hit by the bullet or not
     * @param  {integer}  barNum Bar number which is to be checked for the hit
     * @return {Boolean}        True if the bar is hit or false otherwise
     */
    function isNthBarHit ( barNum ) {
        return (
            bullet.posX >= bars[barNum].posX &&
            bullet.posX <= ( bars[barNum].posX + barWidth )
        ) && (
            bullet.posY >= bars[barNum].posY &&
            bullet.posY <= ( bars[barNum].posY + barHeight ) 
        );
    }

    function handleBulletFire () {

        if ( !bullet.posX && !bullet.posY ) {
            bullet.posX = bot.posX;
            bullet.posY = bot.posY;
        };

        bullet.posX += Math.cos(relAngleX * 0.017) * bulletSpeed;
        bullet.posY -= Math.sin(relAngleY * -0.017) * bulletSpeed;

        if ( ( bullet.posX > canvas.width ) || ( bullet.posX < 0 ) ) {

            relAngleX = relAngleX - relAngleY;
        };

        for (var i = 0; i < barCount; i++) {

            if ( isNthBarHit( i ) ) {                        

                bulletFired = false;
                barHit = true;

                swingBot = true;

                firedPointX = bullet.posX;
                firedPointY = bullet.posY;

                bullet.posX = bullet.posY = 0;

                return;
            };

            barHit = false;
        };

        context.fillRect(bullet.posX, bullet.posY, bullet.width, bullet.height);

        if ( bullet.posY < 0 ) {
            bullet.posX = bullet.posY = 0;
            bulletFired = false
        };
    }

    function resetGame () {
        setBars();
        setBullet();
        setBot();

        swingX = swingY = firedPointX = firedPointY = firedPointDist = 0;
        relAngleX = relAngleY = 0;
        moveBars = barHit = swingBot = false;

        if ( currScore > topScore ) {
            topScore = currScore;
        };

        currScore = 0;
    }


    function gameLoop () {
  
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        populateScore();
        drawPlayer();
        drawBars();

        if ( !isGameOver() ) {

            if ( bulletFired ) {
                handleBulletFire();
            };

            if ( moveBars ) {

                firedPointY = firedPointY - swingY * 4;
           
                currScore++;
            }

            
            if ( barHit && bot.posY > ( firedPointY + 20 ) ) {
                context.beginPath();
    
                context.moveTo( (bot.posX + bot.width / 2), bot.posY );
                context.lineTo(firedPointX, firedPointY);
                context.stroke();

                firedPointDist = Math.sqrt(Math.pow((bot.posX - firedPointX), 2) + Math.pow((bot.posY - firedPointY), 2));

                swingX += ( firedPointX - bot.posX ) / (firedPointDist * swingSpeed);
                swingY += ( firedPointY - bot.posY ) / (firedPointDist * swingSpeed);

            } else {
                barHit = false;
            };

            if ( swingY > 0 ) {
                moveBars = false;
            };

            swingY += 0.01;

            moveBars || (bot.posY += swingY * 4);
            bot.posX += swingX;

            if ( bot.posY < ( canvas.width / 2 ) ) {
                moveBars = true;
            };

            if ( bot.posX < 0 || ( bot.posX + bot.width ) > canvas.width ) {
                swingX = -swingX; // Swing it backward
            };


            if ( bot.posY > canvas.height ) {
                isActive = false; // Bot is dead
            };

        } else {
            if(canReset) {
                resetGame();
                canReset = false;
            }
        }
    }

    function startGame () {
        window.setInterval(gameLoop, 10);
    }

    return {

        init: function () {

            setBars();
            setBullet();
            setBot();

            this.bindUI();
            startGame();
        },

        bindUI: function () {

            canvas.onclick = function ( ev ) {
                fireBullet( ev.clientX, ev.clientY );
            }

        }
    };
}