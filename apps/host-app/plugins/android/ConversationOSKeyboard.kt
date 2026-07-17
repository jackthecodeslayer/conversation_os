package com.astuteweb.cvos.keyboard

import android.inputmethodservice.InputMethodService
import android.view.View
import android.view.inputmethod.InputConnection
import android.widget.Button
import android.widget.LinearLayout
import android.widget.HorizontalScrollView
import android.widget.TextView
import android.graphics.Color
import android.view.Gravity
import android.graphics.drawable.GradientDrawable

class ConversationOSKeyboard : InputMethodService() {

    override fun onCreateInputView(): View {
        // 1. Main Container (Material Dark - Gboard Match)
        val keyboardView = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.parseColor("#202124"))
            setPadding(0, 30, 0, 30)
        }

        // 2. Scheduled Pill
        val scheduledButton = Button(this).apply {
            text = "⏰ Scheduled: 'Happy Bday!'"
            isAllCaps = false
            textSize = 12f
            setTextColor(Color.parseColor("#8AB4F8")) // Google Blue
            
            val shape = GradientDrawable()
            shape.shape = GradientDrawable.RECTANGLE
            shape.cornerRadius = 50f
            shape.setColor(Color.parseColor("#2D3643"))
            background = shape
            
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                100
            ).apply {
                setMargins(40, 0, 0, 30)
            }
            
            setOnClickListener {
                injectScheduledMessage()
            }
        }
        keyboardView.addView(scheduledButton)

        // 3. Horizontal Scroll Container (App Drawer)
        val scrollView = HorizontalScrollView(this).apply {
            isHorizontalScrollBarEnabled = false
        }
        
        val appRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(40, 0, 40, 0)
        }

        // Mock App Data
        val apps = listOf(
            Pair("Tic-Tac", "🎮|https://cvos-backend.onrender.com/game/tictactoe/123"),
            Pair("Words", "📝|https://cvos-backend.onrender.com/game/words/123"),
            Pair("Cards", "🧠|https://cvos-backend.onrender.com/game/flashcards/123"),
            Pair("Poll", "📊|https://cvos-backend.onrender.com/game/poll/123")
        )

        for (app in apps) {
            val parts = app.second.split("|")
            val appCard = createAppCard(app.first, parts[0], parts[1])
            appRow.addView(appCard)
        }

        scrollView.addView(appRow)
        keyboardView.addView(scrollView)

        return keyboardView
    }

    private fun createAppCard(name: String, emoji: String, url: String): View {
        val card = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            
            val shape = GradientDrawable()
            shape.shape = GradientDrawable.RECTANGLE
            shape.cornerRadius = 24f
            shape.setColor(Color.parseColor("#3C4043")) // Material lighter gray
            shape.setStroke(2, Color.parseColor("#5F6368")) // Subtle border
            background = shape
            
            layoutParams = LinearLayout.LayoutParams(180, 200).apply {
                setMargins(0, 0, 30, 0)
            }
            
            setOnClickListener {
                val ic: InputConnection? = currentInputConnection
                ic?.commitText(url, 1)
            }
        }

        val iconLabel = TextView(this).apply {
            text = emoji
            textSize = 28f
            gravity = Gravity.CENTER
        }
        
        val titleLabel = TextView(this).apply {
            text = name
            textSize = 12f
            setTextColor(Color.WHITE)
            gravity = Gravity.CENTER
            setPadding(0, 10, 0, 0)
        }

        card.addView(iconLabel)
        card.addView(titleLabel)
        
        return card
    }

    private fun injectScheduledMessage() {
        val ic: InputConnection? = currentInputConnection
        if (ic != null) {
            val draftMessage = "Happy Birthday! Hope you have a great day 🎉"
            ic.commitText(draftMessage, 1)
        }
    }
}
