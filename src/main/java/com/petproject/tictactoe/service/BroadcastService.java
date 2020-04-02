package com.petproject.tictactoe.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import javax.enterprise.context.ApplicationScoped;

import com.petproject.tictactoe.controller.ConnectionController;
import com.petproject.tictactoe.model.Message;
import com.petproject.tictactoe.model.Player;

import org.slf4j.Logger;

@ApplicationScoped
public class BroadcastService {

    Logger logger;
    ConnectionController cnController;
    List<Player> unavailablePlayersList = Collections.synchronizedList(new ArrayList<Player>());

    public BroadcastService(Logger logger, ConnectionController cnController) {
        this.logger = logger;
        this.cnController = cnController;
    }

    public void broadcast(Map<Player, Message> messages) {
        messages.entrySet().forEach(entry -> {
           broadcastTo(entry.getKey(), entry.getValue());
        });
    }

    private void broadcastTo(Player player, Message message) {
        player.getSession().getAsyncRemote().sendObject(message.toString(), result -> {
            if (result.getException() != null) {
                logger.error("Unable to send message to: {}", player.getName());
                cnController.removeUnavailablePlayer(player);
            } else {
                logger.info("Send message: {} to: {} ", message, player.getName());
            }
        });
    }

}