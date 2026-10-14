# Dice Roller

Roll D&D dice expressions with the same character data and rules as dnd-chars-sheet.

This is a separately installable Owlbear extension. It uses the dnd-chars-sheet 1.2.0 engine hosted in this suite, and has the same player/room browser storage scope as the main character sheet. The URL parameter module=dice selects its focused interface.

No character records are stored as Owlbear room metadata. Browser storage is local and is not cloud synchronization.

The independent page loads the full dnd-chars-sheet engine directly with the correct Builder or Dice mode, avoiding a nested iframe that would disrupt the Owlbear SDK connection.

The independent page loads the full dnd-chars-sheet engine directly with the correct Builder or Dice mode, avoiding a nested iframe that would disrupt the Owlbear SDK connection.

The independent page loads the full dnd-chars-sheet engine directly with the correct Builder or Dice mode, avoiding a nested iframe that would disrupt the Owlbear SDK connection.

Use the same player and Owlbear room for all three modules so that the local dnd-chars-sheet store is shared. The full native source is included under vendor/dnd-chars-sheet/src in the suite repository.
