$(document).ready(function() {

    var emailRegex = new RegExp(
        '^(([^<>()[\\]\\\\.,;:\\s@\\"]+(\\.[^<>()[\\]\\\\.,;:\\s@\\"]+)*)|' +
        '(\\".+\\"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])' +
        '|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$'
    );
    var pwdRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");

    $('.email input').on('keyup', function(e) {
      var email=$(this).val();
      if(emailRegex.test(email))
        {
          $(this).parent().addClass('success');
          $(".pwd").slideDown(1000);
        }
      else
        {
          $(this).parent().removeClass('success');
          $(".pwd").hide(1000);
        }
    });

    //$('.submit').css("display", "none");
    $('INPUT[type="text"]').css("margin", "7px 0");
    $('INPUT[type="password"]').css("margin", "7px 0");
    $('HTML').css("font-size", "inherit");
    $('BODY').css("font-family", "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif");
    $('BODY').css("font-weight", "normal");

    $('.pwd input').on('keyup', function(e) {
      var password=$(this).val();
      if(pwdRegex.test(password))
        {
          $(this).parent().addClass('success');
          $(".submit").slideDown(1000);
          $(".logo").addClass('gotop')
        }
      else
        {
          $(this).parent().removeClass('success');
            $(".logo").removeClass('gotop')
          $(".submit").hide(1000);
        }
    });

});

$(document).ready(function(){
    $('.slider').slick({
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 1500,
        arrows: false,
        fade:false,
        dots: false,
        pauseOnHover: true,
        responsive: [{
            breakpoint: 960,
            settings: {
                slidesToShow: 3
            }
        }, {
            breakpoint: 768,
            settings: {
                slidesToShow: 2
            }
        }, {
            breakpoint: 520,
            settings: {
                slidesToShow: 1
            }
        }]
    });

/*
  Slidemenu
*/
var $body = document.body
var $menu_trigger = $body.getElementsByClassName('menu-trigger')[0];

    if ( typeof $menu_trigger !== 'undefined' ) {
        $menu_trigger.addEventListener('click', function() {
            $body.className = ( $body.className == 'menu-active' )? '' : 'menu-active';
        });
    };
    document.documentElement.setAttribute("data-agent", navigator.userAgent)
});


