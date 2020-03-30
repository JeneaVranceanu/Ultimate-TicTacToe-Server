package com.petproject.tictactoe.service;

import javax.enterprise.context.ApplicationScoped;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;

import org.slf4j.Logger;

import com.petproject.tictactoe.controller.ConnectionController;

import javax.websocket.Session;

@ServerEndpoint("/chat/{username}")
@ApplicationScoped
public class ChatSocket {

    Logger logger;
    ConnectionController cnController;

    public ChatSocket(Logger logger, ConnectionController connectionController) {
        this.logger = logger;
        this.cnController = connectionController;
    }

    @OnOpen
    public void onOpen(Session session, @PathParam("username") String username) {
        cnController.onOpen(session, username);
    }

    @OnMessage
    public void onMessage(String message, @PathParam("username") String username) {
        logger.info("Message received: {}", message);
        cnController.onMessage(message);
    }

    @OnClose
    public void onClose(Session session, @PathParam("username") String username) {       
        logger.info("Close ws connection with parameters: {}", username);
    }

    @OnError
    public void onError(Session session, @PathParam("username") String username, Throwable throwable) {
        logger.error("", throwable);
    }

  

}