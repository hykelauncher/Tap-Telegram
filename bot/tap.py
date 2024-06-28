from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes

# Defina o token do seu bot aqui
TELEGRAM_BOT_TOKEN = '6495837398:AAG-IaCv2edzOmFXR1q13RPSsxF01R-NEMQ'

# Função que será chamada quando o comando /start for recebido
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user_id = update.message.from_user.id
    url = f'https://tictacticcat.fun/?userId={user_id}'
    
    # Criar o botão inline com o URL
    button = InlineKeyboardButton(text="Abrir WebApp", web_app={'url': url})
    keyboard = InlineKeyboardMarkup([[button]])
    
    await update.message.reply_text('Clique no botão abaixo para acessar seu webapp personalizado:', reply_markup=keyboard)

def main() -> None:
    # Crie o Application e passe o token do bot
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()

    # Adicione o handler para o comando /start
    application.add_handler(CommandHandler("start", start))

    # Inicie o bot
    application.run_polling()

if __name__ == '__main__':
    main()
