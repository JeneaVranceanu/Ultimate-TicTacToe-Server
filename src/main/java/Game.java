import java.util.Arrays;
import java.util.Objects;

import javax.websocket.Session;

public class Game {

    Player playerX;
    Player playerO;
    char[] field = new char[9];
    State state;

    public void createGame(String ip, String name, Session session) {
        playerX = new Player(ip, name, 'x', session);
        state = State.WAIT;
    }

    public void connectToGame(String ip, String name, Session session) {
        playerO = new Player(ip, name, 'o', session);
        state = State.START;
    }

    public String info() {

        String xState = Objects.isNull(playerX) ? "X is not connected" : playerX.toString();
        String oState = Objects.isNull(playerO) ? "O is not connected" : playerO.toString();

        return String.format("Game info: \nPlayerX: %s\nPlayerO: %s\nField: %s\nState: %s", 
            xState, oState, Arrays.toString(field), state.name());
    }


    enum State {
        WAIT, START
    }

}