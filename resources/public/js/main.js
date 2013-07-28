$(document).ready(function() {
    $('nav a').live('click', function(evt) {
        var target = $(this).attr('href');
        $.scrollTo(target, 500);
        evt.preventDefault();
    });

    $('.portfolio').each(function() {
      if ($(this).find('img').length > 1) {
        $(this).hoverIntent(function() {
              $(this).find('.screenshots .slider').animate({'left': '-420px'}, 500);
          }, function() {
              $(this).find('.screenshots .slider').animate({'left': '0px'}, 500);
        });
      }
    });

    $('#contact-form textarea').autoResize();

    $('#send').click(function(evt) {
        var data = {},
          errors = [];

        $('#send').hide();
        $('#sending').html('Sending...').show();

        data.name = $('#name').val();
        data.email = $('#email').val();
        data.message = $('#message').val();
        data.comment = $('#comment').val();

        if (data.name.match(/^\s*$/)) {
            errors.push('Please provide your name.');
        }
        if (!data.email.match(/^[a-z0-9._%-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i)) {
            errors.push('Please provide your email.');
        }
        if (data.message.match(/^\s*$/)) {
            errors.push('Please enter your message.');
        }

        if (errors.length) {
            $('#send').show();
            $('#sending').hide();

            $('#dlg-cnt').html(errors.join('<br />'));
            $('#dlg').removeClass('success').addClass('error').reveal();
        } else {
            $.ajax({
                type: 'POST',
                url: '/contact-me',
                dataType: 'json',
                data: data,
                success: function(resp) {
                    $('#send').show();
                    $('#sending').hide();

                    if (resp.result === 'success') {
                        $('#name').val('');
                        $('#email').val('');
                        $('#message').val('');

                        $('#dlg-cnt').html('Your message has been sent.');
                        $('#dlg').removeClass('error').addClass('success').reveal();
                    } else {
                        $('#dlg-cnt').html(resp.result);
                        $('#dlg').removeClass('success').addClass('error').reveal();
                    }
                }
            });
        }
    });
});
