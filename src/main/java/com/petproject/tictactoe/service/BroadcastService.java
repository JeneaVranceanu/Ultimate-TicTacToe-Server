package com.petproject.tictactoe.service;

import java.nio.channels.ClosedChannelException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

import javax.enterprise.context.ApplicationScoped;

import com.petproject.tictactoe.model.Message;
import com.petproject.tictactoe.model.Player;

import org.slf4j.Logger;

@ApplicationScoped
public class BroadcastService {

    Logger logger;
    List<Player> unavailablePlayersList = Collections.synchronizedList(new ArrayList<Player>());

    public BroadcastService(Logger logger) {
        this.logger = logger;
    }

    public void broadcast(Map<Player, Message> messages) throws ClosedChannelException {
        Map<Player, Boolean> messageStatuses = new ConcurrentHashMap<>();
        messages.entrySet().forEach(entry -> {
            /** Send message to Player and record message state to Map */
            messageStatuses.put(entry.getKey(), broadcastTo(entry.getKey(), entry.getValue()));
        });
        checkUnavailablePlayers(messageStatuses);
    }

    private boolean broadcastTo(Player player, Message message) {
        AtomicBoolean messageIsSended = new AtomicBoolean(true);
        player.getSession().getAsyncRemote().sendObject(message.toString(), result -> {
            if (result.getException() != null) {
                logger.error("Unable to send message to: {}", player.getId());
                messageIsSended.set(false);
            }
            logger.info("Send message: {} to: {} ", message, player.getName());
        });
        return messageIsSended.get();
    }

    /**
     * Check if all messages transferred to players 
     * else throw ClosedChannelException
     * 
     * @param map message status map
     * @throws ClosedChannelException if has unavailable players
     */
    private void checkUnavailablePlayers(Map<Player, Boolean> map) throws ClosedChannelException {
        AtomicBoolean exist = new AtomicBoolean(false);
        map.entrySet().forEach(entry -> {
            if (!entry.getValue()) {
                unavailablePlayersList.add(entry.getKey());
                exist.set(true);
            }
        });
        if (exist.get()) {
            throw new ClosedChannelException();
        }
    }

    public List<Player> getUnavailablePlayers() {
        return unavailablePlayersList;
    }

    public void removeUnavailablePlayersFromList(List<Player> list) {
        list.forEach(p -> unavailablePlayersList.remove(p));
    }

}