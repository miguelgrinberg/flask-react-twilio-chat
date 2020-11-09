import os
import click
from dotenv import load_dotenv
from flask import Flask, request, abort
from flask.cli import AppGroup
from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import ChatGrant
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

load_dotenv()
twilio_client = Client()

app = Flask(__name__)

chatrooms_cli = AppGroup('chatrooms', help='Manage your chat rooms.')
app.cli.add_command(chatrooms_cli)


@chatrooms_cli.command('list', help='list all chat rooms')
def list():
    conversations = twilio_client.conversations.conversations.list()
    for conversation in conversations:
        print(f'{conversation.friendly_name} ({conversation.sid})')


@chatrooms_cli.command('create', help='create a chat room')
@click.argument('name')
def create(name):
    conversation = None
    for conv in twilio_client.conversations.conversations.list():
        if conv.friendly_name == name:
            conversation = conv
            break
    if conversation is not None:
        print('Chat room already exists')
    else:
        twilio_client.conversations.conversations.create(friendly_name=name)


@chatrooms_cli.command('delete', help='delete a chat room')
@click.argument('name')
def delete(name):
    conversation = None
    for conv in twilio_client.conversations.conversations.list():
        if conv.friendly_name == name:
            conversation = conv
            break
    if conversation is None:
        print('Chat room not found')
    else:
        conversation.delete()


@app.route('/login', methods=['POST'])
def login():
    payload = request.get_json(force=True)
    username = payload.get('username')
    if not username:
        abort(401)

    # create the user (if it does not exist yet)
    participant_role_sid = None
    for role in twilio_client.conversations.roles.list():
        if role.friendly_name == 'participant':
            participant_role_sid = role.sid
    try:
        twilio_client.conversations.users.create(identity=username,
                                                 role_sid=participant_role_sid)
    except TwilioRestException as exc:
        if exc.status != 409:
            raise

    # add the user to all the conversations
    conversations = twilio_client.conversations.conversations.list()
    for conversation in conversations:
        try:
            conversation.participants.create(identity=username)
        except TwilioRestException as exc:
            if exc.status != 409:
                raise

    # generate an access token
    twilio_account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
    twilio_api_key_sid = os.environ.get('TWILIO_API_KEY_SID')
    twilio_api_key_secret = os.environ.get('TWILIO_API_KEY_SECRET')
    service_sid = conversations[0].chat_service_sid
    token = AccessToken(twilio_account_sid, twilio_api_key_sid,
                        twilio_api_key_secret, identity=username)
    token.add_grant(ChatGrant(service_sid=service_sid))

    # send a response
    return {
        'chatrooms': [[conversation.friendly_name, conversation.sid]
                      for conversation in conversations],
        'token': token.to_jwt().decode(),
    }
