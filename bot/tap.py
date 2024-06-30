from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes

# Defina o token do seu bot aqui
TELEGRAM_BOT_TOKEN = '6495837398:AAG-IaCv2edzOmFXR1q13RPSsxF01R-NEMQ'

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user_id = update.message.from_user.id
    
    # Verifica se há parâmetros após o comando /start
    if context.args:
        invite = context.args[0]  # O primeiro argumento após /start
        print(f'Invite recebido: {invite}')
    else:
        invite = None
        print('Invite não recebido')

    # Montar o URL do WebApp
    url = f'https://tictacticcat.fun/?userId={user_id}'
    if invite:
        url += f'&invite={invite}'
    
    # Criar o botão inline com o URL
    button = InlineKeyboardButton(text="Abrir WebApp", web_app={'url': url})
    keyboard = InlineKeyboardMarkup([[button]])
    
    await update.message.reply_text('Clique no botão abaixo para acessar seu webapp personalizado:', reply_markup=keyboard)

async def tap(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user_id = update.message.from_user.id
    
    # Verifica se há parâmetros após o comando /tap
    if context.args:
        invite = context.args[0]  # O primeiro argumento após /tap
        print(f'Invite recebido: {invite}')
    else:
        invite = None
        print('Invite não recebido')

    # Montar o URL do WebApp
    url = f'https://tictacticcat.fun/?userId={user_id}'
    if invite:
        url += f'&invite={invite}'
    
    # Criar o botão inline com o URL
    button = InlineKeyboardButton(text="Abrir WebApp", web_app={'url': url})
    keyboard = InlineKeyboardMarkup([[button]])
    
    await update.message.reply_text('Clique no botão abaixo para acessar seu webapp personalizado:', reply_markup=keyboard)

def main() -> None:
    # Crie o Application e passe o token do bot
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()

    # Adicione o handler para o comando /start e /tap
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("tap", tap))

    # Inicie o bot
    application.run_polling()

if __name__ == '__main__':
    main()
