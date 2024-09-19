document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#details-view').style.display = 'none';


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  document.querySelector('#compose-form').addEventListener('submit', send_email) ;

}

function view_email(id,mailbox) {
  fetch(`/emails/${id}`)
      .then(response => response.json())
      .then(email => {
        // Print email
        console.log(email);
        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#compose-view').style.display = 'none';
        document.querySelector('#details-view').style.display = 'block';
        const details = document.querySelector('#details-view');
        details.innerHTML =
            `  <ul>
              <li><strong>From: </strong> ${email.sender} </li>
              <li ><strong> To: </strong> ${email.recipients} </li>
              <li><strong>Subject: </strong> ${email.subject} </li>
              <li><strong>Timestamp: </strong> ${email.timestamp} </li>
              <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
              <hr>
              <li>${email.body} </li>
               
            </ul>`;

        //change to read
        if (!email.read) {
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              read: true
            })
          })
        }
          if (mailbox != 'sent') {
          const arch_button = document.createElement('button');
          arch_button.innerHTML = email.archived ? "Unarchived" : "Archive";
          arch_button.className = email.archived ? "btn btn-success" : "btn btn-danger";
          arch_button.addEventListener('click', function () {
            fetch(`/emails/${email.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                archived: !email.archived
              })
            })
                .then( () => {load_mailbox('inbox')})
          });
          details.append(arch_button);
          }
        document.querySelector('#reply').addEventListener('click', function (){
          compose_email();
          document.querySelector('#compose-recipients').value = `${email.sender}`;
          let subject = email.subject;
          if (subject.split(' ',1)[0] != "Re:"){
            subject = "Re:" + email.subject;
          }
          document.querySelector('#compose-subject').value = subject;
          document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body} `;
          document.querySelector('#compose-form').addEventListener('submit', send_email) ;




        });

      });
}

        function load_mailbox(mailbox) {

          // Show the mailbox and hide other views
          document.querySelector('#emails-view').style.display = 'block';
          document.querySelector('#compose-view').style.display = 'none';
          document.querySelector('#details-view').style.display = 'none';

          document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
          fetch(`/emails/${mailbox}`)
              .then(response => response.json())
              .then(emails => {
                // Print emails
                console.log(emails);

                emails.forEach(email => {
                  const newEmail = document.createElement('div');
                  newEmail.className = "style_border";
                  newEmail.innerHTML = `<strong>${email.sender} </strong> <span class="subject">${email.subject}</span>
         <span class="timestamp">${email.timestamp}</span>`;
                  newEmail.className = email.read ? 'read' : 'unread';
                  newEmail.addEventListener('click', () => {
                    view_email(email.id, mailbox);

                  })

                  document.querySelector('#emails-view').append(newEmail);


                })

              });
        }

        function send_email(event) {
          event.preventDefault();
          const recipients = document.querySelector('#compose-recipients').value;
          const subject = document.querySelector('#compose-subject').value;
          const body = document.querySelector('#compose-body').value;
          fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
              recipients: recipients,
              subject: subject,
              body: body
            })
          })
              .then(response => response.json())
              .then(result => {

                load_mailbox("sent");
              });

        }


