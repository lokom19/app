# -*- coding: utf-8 -*-

import tkinter
from PIL import Image, ImageTk


class App:
    def __init__(self):
        self.root = tkinter.Tk()

        # создание рабочей области
        self.frame = tkinter.Frame(self.root)
        self.frame.grid()

        self.image = Image.open("C:\\apple.PNG")
        self.photo = ImageTk.PhotoImage(self.image)

        self.but = tkinter.Button(self.frame, text="Не инвестирую", command = self.my_event_handler).grid(row=1, column=1)
        self.btn = tkinter.Button(self.frame, text="Инвестирую", command = self.my_event_handler).grid(row=1, column=1000)

        # Добавим изображение
        self.canvas = tkinter.Canvas(self.root, height=600, width=700)
        self.c_image = self.canvas.create_image(0, 0, anchor='nw', image=self.photo)
        self.canvas.grid(row=2, column=1)
        self.root.mainloop()

    def my_event_handler(self):
        self.image = Image.open('C:\\tesla.PNG')
        self.photo = ImageTk.PhotoImage(self.image)
        self.c_image = self.canvas.create_image(0, 0, anchor='nw', image=self.photo)
        self.canvas.grid(row=2, column=1)


app = App()
