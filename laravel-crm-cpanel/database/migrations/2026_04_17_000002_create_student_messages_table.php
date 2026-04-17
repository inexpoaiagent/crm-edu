<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('student_messages')) {
            return;
        }

        Schema::create('student_messages', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('student_user_id');
            $table->unsignedBigInteger('recipient_user_id')->nullable();
            $table->string('sender_role', 30)->default('student');
            $table->text('body');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'student_user_id'], 'student_messages_tenant_student_idx');
            $table->foreign('tenant_id', 'student_messages_tenant_fk')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('student_id', 'student_messages_student_fk')->references('id')->on('students')->cascadeOnDelete();
            $table->foreign('student_user_id', 'student_messages_student_user_fk')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('recipient_user_id', 'student_messages_recipient_fk')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('student_messages')) {
            return;
        }

        Schema::table('student_messages', function (Blueprint $table): void {
            $table->dropForeign('student_messages_tenant_fk');
            $table->dropForeign('student_messages_student_fk');
            $table->dropForeign('student_messages_student_user_fk');
            $table->dropForeign('student_messages_recipient_fk');
            $table->dropIndex('student_messages_tenant_student_idx');
        });
        Schema::dropIfExists('student_messages');
    }
};
