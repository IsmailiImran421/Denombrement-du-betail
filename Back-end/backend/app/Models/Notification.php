<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    protected $table = 'notifications';
    protected $primaryKey = 'id_notification';

    protected $fillable = [
        'id_utilisateur',
        'id_comite',
        'titre',
        'message',
        'type_tache',
        'id_reference',
        'lu',
    ];

    protected $casts = [
        'lu' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_utilisateur', 'id_utilisateur');
    }

    public function comite(): BelongsTo
    {
        return $this->belongsTo(Comite::class, 'id_comite', 'id_comite');
    }
}
